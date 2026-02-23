import { GoogleGenerativeAI } from "@google/generative-ai";
import { client, QDRANT_COLLECTIONS } from "../lib/qdrant";
import { dataSource } from "../lib/data-source";
import { redis } from "../lib/redis";
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
    // this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
    });
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

  async syncCourse(courseId: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) return null;

    const textToEmbed = `Course: ${course.nameEn} (${course.nameTh})\nDescription: ${course.description}`;
    const embedding = await this.getEmbedding(textToEmbed);

    await client.upsert(QDRANT_COLLECTIONS.COURSES, {
      wait: true,
      points: [
        {
          id: uuidv5(course.id, NAMESPACE),
          vector: embedding,
          payload: {
            originalId: course.id,
            nameEn: course.nameEn,
            nameTh: course.nameTh,
            description: course.description,
            credits: course.credits,
          },
        },
      ],
    });
    return true;
  }

  async syncJob(jobId: string) {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) return null;

    const textToEmbed = `Job: ${job.name}\nDetails: ${job.details}`;
    const embedding = await this.getEmbedding(textToEmbed);

    await client.upsert(QDRANT_COLLECTIONS.JOBS, {
      wait: true,
      points: [
        {
          id: job.id,
          vector: embedding,
          payload: {
            name: job.name,
            details: job.details,
          },
        },
      ],
    });
    return true;
  }

  async syncReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ["course"],
    });
    if (!review) return null;

    const textToEmbed = `Course: ${review.course?.nameEn}\nReview: ${review.content}\nPros: ${review.pros}\nCons: ${review.cons || "-"}`;
    const embedding = await this.getEmbedding(textToEmbed);

    await client.upsert(QDRANT_COLLECTIONS.REVIEWS, {
      wait: true,
      points: [
        {
          id: review.id,
          vector: embedding,
          payload: {
            courseId: review.courseId,
            content: review.content,
            rating: review.rating,
            pros: review.pros,
            cons: review.cons,
          },
        },
      ],
    });
    return true;
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
    const reviews = await this.reviewRepo.find({
      where: { courseId: courseId },
      take: 20,
    });

    if (reviews.length === 0) return "No reviews found.";

    const reviewsText = reviews
      .map((r) => `- ${r.content} (Pros: ${r.pros}, Cons: ${r.cons})`)
      .join("\n");
    const prompt = `Summarize the following student reviews for the course. Highlight pros and cons:\n\n${reviewsText}`;

    return await this.generateText(prompt);
  }

  async summarizeReviewsFromQdrant(courseId: string) {
    //Check cache
    const cacheKey = `course_summary:${courseId}`;
    try {
      const cachedSummary = await redis.get(cacheKey);
      if (cachedSummary) {
        console.log(`[Cache Hit] Summary for course ${courseId}`);
        return cachedSummary;
      }
    } catch (err) {
      console.error("Redis get error", err);
    }

    //Get reviews from Qdrant
    const numberOfReview = 10;
    const searchResult = await client.scroll(QDRANT_COLLECTIONS.REVIEWS, {
      filter: {
        must: [
          {
            key: "courseId",
            match: {
              value: courseId,
            },
          },
        ],
      },
      limit: numberOfReview,
      with_payload: true,
    });

    const points = searchResult.points;

    if (points.length === 0) return "No reviews found in Qdrant.";

    const reviewContext = points
      .map(
        (res, index) => `รีวิวที่ ${index + 1}: ${JSON.stringify(res.payload)}`,
      )
      .join("\n");

    console.log("Review Context: ", reviewContext);

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
    });
    const prompt = `
    คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูลทางการศึกษาและ AI Assistant สำหรับนิสิตมหาวิทยาลัย
    ภารกิจ: จงสรุปรีวิวจากนักศึกษาจำนวน ${numberOfReview} รายการต่อไปนี้ ของรายวิชา ${course?.nameTh}
    
    ข้อกำหนด:  
    - ตอบเป็นภาษาไทย
    - **content**: ให้สรุปภาพรวมจาก field "content" ของรีวิว
    - **pros**: ให้สรุปจุดเด่นจาก field "pros" (ถ้าไม่มีให้วิเคราะห์จาก content)
    - **cons**: ให้สรุปจุดควรระวังจาก field "cons" (ถ้าไม่มีให้วิเคราะห์จาก content)
    - **testPrepare**: ให้สรุปวิธีการเตรียมตัวสอบจาก field "testPrepare" (ถ้าไม่มีให้วิเคราะห์จาก content)
    - **rating**: ให้สรุปคะแนนเฉลี่ยจาก field "rating"
    - คืนค่าเป็น JSON เท่านั้นตามโครงสร้างนี้:
    {
      "content": "เนื้อหาสรุปแบบภาพรวม",
      "pros": ["จุดเด่นที่ 1", "จุดเด่นที่ 2"],
      "cons": ["จุดควรระวังที่ 1", "จุดควรระวังที่ 2"],
      "testPrepare": ["วิธีการเตรียมตัวสอบที่ 1", "วิธีการเตรียมตัวสอบที่ 2"],
      "rating": "คะแนนเฉลี่ย"
    }

    รีวิวที่ใช้สรุป:
    ${reviewContext}
    `;

    const result = await this.generateText(prompt);

    try {
      // Cache for 24 hours (86400 seconds)
      await redis.setEx(cacheKey, 86400, result);
    } catch (err) {
      console.error("Redis setEx error", err);
    }

    return result;
  }
}
