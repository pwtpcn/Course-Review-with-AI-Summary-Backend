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
  } catch (err) {
    console.error("Error initializing Qdrant collections:", err);
  }
}
