import { GoogleGenerativeAI } from "@google/generative-ai";
import { client, QDRANT_COLLECTIONS } from "../lib/qdrant";
import { dataSource } from "../lib/data-source";
import { redis } from "../lib/redis";
import { Course } from "../schema/course";
import { Job } from "../schema/job";
import { Review } from "../schema/review";
import { v5 as uuidv5 } from "uuid";
import { calculateMeanVector } from "../util/calculateMeanVector";

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
      model: "gemini-2.5-flash-lite",
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
          year: course.year,
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
          testPrepare: review.testPrepare,
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
            year: course.year,
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
            testPrepare: review.testPrepare,
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

  async summarizeReviewsFromQdrant(courseId: string) {
    //Check cache
    const cacheKey = `course_summary:${courseId}`;
    try {
      console.log("Checking cache for course", courseId);
      const cachedSummary = await redis.get(cacheKey);
      if (cachedSummary) {
        console.log(`[Cache Hit] Summary for course ${courseId}`);
        return JSON.parse(cachedSummary);
      } else {
        console.log(`[Cache Miss] Summary for course ${courseId}`);
      }
    } catch (err) {
      console.error("Redis get error", err);
    }

    // Get reviews from Qdrant
    const numberOfReview = 24;

    // Latest Review
    const recentSearchResult = await client.scroll(QDRANT_COLLECTIONS.REVIEWS, {
      filter: {
        must: [{ key: "courseId", match: { value: courseId } }],
      },
      limit: 8,
      with_payload: true,
    });
    const recentPoints = recentSearchResult.points;

    // Get Vector for calculate Mean Vector
    const allSearchResult = await client.scroll(QDRANT_COLLECTIONS.REVIEWS, {
      filter: {
        must: [{ key: "courseId", match: { value: courseId } }],
      },
      limit: 100,
      with_payload: true,
      with_vector: true,
    });
    const allPoints = allSearchResult.points;

    if (allPoints.length === 0) {
      // คืนค่ารูปแบบ JSON กลับไปเลยเพื่อไม่ให้ Controller พังตอน JSON.parse และไม่ต้องเปลืองโควตา AI
      console.log("No reviews found for course", courseId);
      return {
        content: "ยังไม่มีข้อมูลรีวิวเพียงพอสำหรับการสรุปผลในขณะนี้",
        pros: [],
        cons: [],
        testPrepare: [],
        rating: 0,
      };
    }

    // Separate by Sentiment (Rating)
    const positivePoints = allPoints.filter(
      (p) => (p.payload as any).rating >= 4,
    );
    const negativePoints = allPoints.filter(
      (p) => (p.payload as any).rating <= 3,
    );

    const selectedReviews: any[] = [...recentPoints];

    // Positive Review
    if (positivePoints.length > 0) {
      const positiveVectors = positivePoints.map((p) => p.vector as number[]);
      const positiveMean = calculateMeanVector(positiveVectors);
      const posSearchResult = await client.search(QDRANT_COLLECTIONS.REVIEWS, {
        vector: positiveMean,
        filter: {
          must: [
            { key: "courseId", match: { value: courseId } },
            { key: "rating", range: { gte: 4 } },
          ],
        },
        limit: 8,
        with_payload: true,
      });
      selectedReviews.push(...posSearchResult);
    }

    // Negative Review
    if (negativePoints.length > 0) {
      const negativeVectors = negativePoints.map((p) => p.vector as number[]);
      const negativeMean = calculateMeanVector(negativeVectors);
      const negSearchResult = await client.search(QDRANT_COLLECTIONS.REVIEWS, {
        vector: negativeMean,
        filter: {
          must: [
            { key: "courseId", match: { value: courseId } },
            { key: "rating", range: { lte: 3 } },
          ],
        },
        limit: 8,
        with_payload: true,
      });
      selectedReviews.push(...negSearchResult);
    }

    // Deduplicate
    const uniqueReviews = Array.from(
      new Map(selectedReviews.map((r) => [r.id, r])).values(),
    ).slice(0, numberOfReview);

    const reviewContext = uniqueReviews
      .map(
        (res, index) => `รีวิวที่ ${index + 1}: ${JSON.stringify(res.payload)}`,
      )
      .join("\n");

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
    });

    // หากมีรีวิวน้อย เราสามารถกำกับใน prompt ให้ AI สรุปแบบถ่อมตัวได้
    const contextWarning =
      uniqueReviews.length <= 3
        ? "(เนื่องจากจำนวนรีวิวมีน้อยมาก ให้สรุปตามข้อมูลที่มีและอาจระบุสั้นๆ ว่าข้อมูลยังน้อย)"
        : "";

    const prompt = `
    คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์ข้อมูลทางการศึกษาและ AI Assistant สำหรับนิสิตมหาวิทยาลัย
    ภารกิจ: จงสรุปรีวิวจากนักศึกษาจำนวน ${uniqueReviews.length} รายการต่อไปนี้ ของรายวิชา ${course?.nameTh} ${contextWarning}
    
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

    const summary = await this.generateText(prompt);

    const cleanSummary = summary.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleanSummary);

    try {
      // Cache for 24 hours (86400 seconds)
      await redis.setEx(cacheKey, 86400, JSON.stringify(result));
      console.log("Save result to Redis successfully")
    } catch (err) {
      console.log("Save result to Redis failed")
      console.error("Redis setEx error", err);
    }

    return result;
  }
}
