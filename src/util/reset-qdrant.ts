import { client, QDRANT_COLLECTIONS } from "../lib/qdrant";

async function resetCollections() {
  console.log("Deleting existing collections...");
  for (const name of Object.values(QDRANT_COLLECTIONS)) {
    try {
      await client.deleteCollection(name);
      console.log(`Deleted collection: ${name}`);
    } catch (err) {
      console.log(`Could not delete (or didn't exist): ${name}`);
    }
  }
  console.log(
    "Done. Please restart your server to recreate them with new settings.",
  );
}

resetCollections();
