import { GoogleGenerativeAI } from "@google/generative-ai";
import { client, QDRANT_COLLECTIONS } from "../lib/qdrant";
import { dataSource } from "../lib/data-source";
import { Course } from "../schema/course";
import { Job } from "../schema/job";
import { Review } from "../schema/review";
import { v5 as uuidv5 } from "uuid";

// Namespace for generating deterministic UUIDs from string IDs
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // Standard DNS namespace

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private embeddingModel: any;
  private courseRepo = dataSource.getRepository(Course);
  private jobRepo = dataSource.getRepository(Job);
  private reviewRepo = dataSource.getRepository(Review);

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });
  }

  async getEmbedding(text: string) {
    const result = await this.embeddingModel.embedContent(text);
    return result.embedding.values;
  }

  async generateText(prompt: string) {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  // --- Sync Functions ---

  async syncCourses() {
    const courses = await this.courseRepo.find();
    const points = [];

    for (const course of courses) {
      const textToEmbed = `Course: ${course.nameEn} (${course.nameTh})\nDescription: ${course.description}`;
      const embedding = await this.getEmbedding(textToEmbed);

      points.push({
        id: uuidv5(course.id, NAMESPACE),
        vector: embedding,
        payload: {
          originalId: course.id,
          nameEn: course.nameEn,
          nameTh: course.nameTh,
          description: course.description,
          credits: course.credits,
        },
      });
    }

    if (points.length > 0) {
      // Qdrant upsert batch
      await client.upsert(QDRANT_COLLECTIONS.COURSES, {
        wait: true,
        points: points,
      });
    }
    return { count: points.length };
  }

  async syncJobs() {
    const jobs = await this.jobRepo.find();
    const points = [];

    for (const job of jobs) {
      const textToEmbed = `Job: ${job.name}\nDetails: ${job.details}`;
      const embedding = await this.getEmbedding(textToEmbed);

      points.push({
        id: job.id,
        vector: embedding,
        payload: {
          name: job.name,
          details: job.details,
        },
      });
    }

    if (points.length > 0) {
      await client.upsert(QDRANT_COLLECTIONS.JOBS, {
        wait: true,
        points: points,
      });
    }
    return { count: points.length };
  }

  async syncReviews() {
    const reviews = await this.reviewRepo.find({
      relations: ["course"],
    });
    const points = [];

    for (const review of reviews) {
      // Create a content string that represents the review functionality
      const textToEmbed = `Course: ${review.course?.nameEn}\nReview: ${review.content}\nPros: ${review.pros}\nCons: ${review.cons || "-"}`;
      const embedding = await this.getEmbedding(textToEmbed);

      points.push({
        id: review.id,
        vector: embedding,
        payload: {
          courseId: review.courseId,
          content: review.content,
          rating: review.rating,
          pros: review.pros,
          cons: review.cons,
        },
      });
    }

    if (points.length > 0) {
      await client.upsert(QDRANT_COLLECTIONS.REVIEWS, {
        wait: true,
        points: points,
      });
    }
    return { count: points.length };
  }

  // --- Search/Recommendation Functions ---

  async recommendCourses(jobDescription: string, limit: number = 5) {
    const queryVector = await this.getEmbedding(jobDescription);
    const searchResult = await client.search(QDRANT_COLLECTIONS.COURSES, {
      vector: queryVector,
      limit: limit,
      with_payload: true,
    });
    return searchResult;
  }

  async summarizeReviews(courseId: string) {
    // 1. Fetch reviews from DB or Qdrant? DB is better for "all reviews of this course".
    // Qdrant is good for "reviews about X".
    // Let's use DB to get all reviews for the course, then summarize.
    // OR better: Use Qdrant to find "most relevant reviews" if we want to answer a question.
    // But for general summary, DB fetch might be safer if not too many.

    // Let's implement RAG-style summary: "Summarize what students say about this course"

    const reviews = await this.reviewRepo.find({
      where: { courseId: courseId },
      take: 20, // Limit to 20 recent reviews to fit context
    });

    if (reviews.length === 0) return "No reviews found.";

    const reviewsText = reviews
      .map((r) => `- ${r.content} (Pros: ${r.pros}, Cons: ${r.cons})`)
      .join("\n");
    const prompt = `Summarize the following student reviews for the course. Highlight pros and cons:\n\n${reviewsText}`;

    return await this.generateText(prompt);
  }
}
