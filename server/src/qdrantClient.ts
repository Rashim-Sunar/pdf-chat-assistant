import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "dotenv";

config();

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "pdf_documents";

/* =========================
   Create embeddings ONCE
========================= */
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENROUTER_API_KEY!,
  configuration: {
    baseURL: process.env.OPENROUTER_BASE_URL,
  },
});

/* =========================
   Singleton vector store
========================= */
let vectorStore: QdrantVectorStore | null = null;

export const getVectorStore = async (): Promise<QdrantVectorStore> => {
  if (!vectorStore) {
    vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: QDRANT_URL,
        collectionName: COLLECTION_NAME,
      }
    );

    console.log("✅ Qdrant vector store connected");
  }

  return vectorStore;
};
