import { QdrantClient } from "@qdrant/js-client-rest";

export const QDRANT_COLLECTIONS = {
  REVIEWS: "reviews",
  COURSES: "courses",
  JOBS: "jobs",
};

// Gemini embedding-001 size
const VECTOR_SIZE = 3072;

export const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export async function initQdrantCollections() {
  try {
    const result = await client.getCollections();
    const existingNames = new Set(result.collections.map((c) => c.name));

    for (const name of Object.values(QDRANT_COLLECTIONS)) {
      if (!existingNames.has(name)) {
        console.log(`Creating collection: ${name}`);
        await client.createCollection(name, {
          vectors: {
            size: VECTOR_SIZE,
            distance: "Cosine",
          },
        });
      } else {
        console.log(`Collection already exists: ${name}`);
      }
    }

    // Set payload
    try {
      await client.createPayloadIndex(QDRANT_COLLECTIONS.REVIEWS, {
        field_name: "courseId",
        field_schema: "keyword",
      });
      console.log("Payload index ensured for reviews.courseId");

      await client.createPayloadIndex(QDRANT_COLLECTIONS.REVIEWS, {
        field_name: "rating",
        field_schema: "integer",
      });
      console.log("Payload index ensured for reviews.rating");
    } catch (err: any) {
      console.log(`Note on index creation: ${err.message}`);
    }
  } catch (err) {
    console.error("Error initializing Qdrant collections:", err);
  }
}
