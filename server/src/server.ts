import express, { Application, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from 'cors';
import { connectRabbitMQ, publishToQueue } from "./rabbitmq.js";
import { getVectorStore } from "./qdrantClient.js";
import OpenAI from "openai";

const app: Application = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

/* =========================
   RabbitMQ Init
   ========================= */
await connectRabbitMQ();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, 
  baseURL: process.env.OPENROUTER_BASE_URL,
});

/* =========================
   Ensure uploads directory
   ========================= */
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* =========================
   Multer Disk Storage
   ========================= */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

/* =========================
   File Filter (PDF only)
   ========================= */
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

/* =========================
   Multer Upload Config
   ========================= */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/* =========================
   Middleware
   ========================= */
app.use(express.json());

/* =========================
   Routes
   ========================= */
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Express + TypeScript + pnpm");
});

/**
 * Upload PDF Endpoint
 * POST /upload
 * form-data -> key: pdf
 */
app.post("/upload", upload.single("pdf"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    /* 🔥 Publish message to RabbitMQ */
    publishToQueue({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    });

    res.status(201).json({
      message: "PDF uploaded successfully",
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        path: req.file.path
      }
    });
  }
);

/**
 * Chat / Retriever Endpoint
 * POST /chat
 * body: { query: string }
 */
app.post("/chat", async (req: Request, res: Response) => {
  try {
      const { query } = req.body;
    //  const query = "Redis lock expiry";

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        message: "Query is required and must be a string",
      });
    }

    /*=========================
    1.Create Vector Store
    ============================*/
    const vectorStore = await getVectorStore();

    /* =========================
    2. Create retriever
    ========================= */
    const retriever = vectorStore.asRetriever({
      k: 5,
    });

    /* =========================
    3. Retrieve relevant chunks
    ========================= */
    const documents = await retriever.invoke(query);

    /* =========================
       4. Prepare Context
    ========================= */
    const context = documents.map(
        (doc, index) =>
          `Source ${index + 1}:\n${doc.pageContent}`
      )
      .join("\n\n");
    
    /* =========================
       5. Call OpenAI (Answer)
    ========================= */
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a helpful AI assistant.

            Rules:
            1. If the answer is available in the provided documents, answer strictly based on them.
            2. If the question is general and not covered by the documents, answer using your general knowledge.
            3. Clearly mention when the answer is NOT based on the documents.
            4. Do NOT hallucinate document-specific facts.

            Example: 
            1. User: Hi (Answer with your general knowledge.) 
            System:"Hello how can i assist you today."
          `
        },
        {
          role: "user",
          content: `
            Context: ${context}
            Question:
            ${query}
            `,
        },
      ],
      temperature: 0.2,
    });


    const answer = completion?.choices[0]?.message.content;
    /* =========================
        5. Response
    ========================= */
    res.status(200).json({
      query,
      answer,
      sources: documents.map((doc) => ({
        filename: doc.metadata?.filename,
        pageNumber: doc.metadata?.loc?.pageNumber,
        chunkIndex: doc.metadata?.chunkIndex,
      })),
    });

  } catch (error) {
    console.error("❌ Chat retrieval failed:", error);

    res.status(500).json({
      message: "Failed to retrieve relevant context",
    });
  }
});


/* =========================
   Error Handling
========================= */
app.use(
  (err: Error, _req: Request, res: Response, _next: Function) => {
    res.status(400).json({ error: err.message });
  }
);

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
