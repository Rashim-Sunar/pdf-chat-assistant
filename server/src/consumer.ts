import amqp from 'amqplib';
import type { Document } from "@langchain/core/documents";
import { config } from "dotenv";
import { getVectorStore } from "./qdrantClient.js";

// To convert pdf into chunk:  goto langchain javascript pdf loader
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// To split the documents
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

config();

const QUEUE_NAME = "pdf_upload_queue";
const RABBITMQ_URL = "amqp://admin:admin@localhost:5672";

const startConsumer = async () => {

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });

  console.log('📥 Waiting for PDF messages...');

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      console.log('📄 Processing PDF:', data.filename);

      /* TODO: 
          Path: data.path
          Read the pdf from the path,
          chunk the pdf,
          call the openai embedding model for every chunk,
          store the chunk in the qdrant db
      */

      // 1. Load the pdf (returns Document[])
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();

      // 2. Split the documents
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 50,
      });

      const chunks = await splitter.splitDocuments(docs);

      /* =========================
          3. Enrich metadata
      ========================= */
      const enrichedDocs: Document[] = chunks.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          filename: data.filename,
          originalName: data.originalName,
          chunkIndex: index,
          uploadedAt: data.uploadedAt,
        },
      }));

      /* =========================
          4. Store chunks in Qdrant
      ========================= */
      const vectorStore = await getVectorStore();
      await vectorStore.addDocuments(enrichedDocs);

      console.log(
        `✅ Stored ${enrichedDocs.length} chunks for ${data.filename}`
      );

      // 6. ACK message (SUCCESS)
      channel.ack(msg);

    } catch (error) {
      console.error('❌ Error processing PDF message:', error);

      // ❗ IMPORTANT:
      // Do NOT acknowledge the message here.
      // RabbitMQ will retry the message automatically.
    }
  });
};

startConsumer().catch((err) => {
  console.error("❌ Failed to start consumer:", err);
});
