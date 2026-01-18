# 📄 PDF Chat Assistant (RAG-based)

A **Retrieval-Augmented Generation (RAG)** application that allows users to upload PDF documents and interact with them using a conversational AI interface. The system retrieves relevant content from uploaded PDFs and generates accurate, context-aware answers using OpenAI.

---


### 🚀 What This Project Demonstrates

This project demonstrates real-world AI system design, combining:

- Retrieval-Augmented Generation (RAG)
- Vector databases
- Message queues
- Clean API design
- Full-stack development

---

## 🚀 Features

- 📤 Upload and process PDF documents
- 🔍 Semantic search using vector embeddings
- 💬 Chat interface to ask questions about PDFs
- 🧠 Hybrid AI responses:
  - Uses document context when available
  - Falls back to general knowledge for unrelated questions
- 📌 Source-aware answers (ready for citation support)
- 🎨 Clean, responsive, professional UI
- ⚡ Built with modern full-stack technologies

---

## 🏗️ Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**

### Backend
- **Node.js**
- **Express**
- **LangChain**
- **OpenAI API**
- **Qdrant (Vector Database)**
- **RabbitMQ (Message Queue)**
---

## 🧠 Architecture Overview
```sh
User Query
   ↓
Chat UI (Next.js)
   ↓
API Gateway (Express)
   ↓
Vector Store (Embeddings)
   ↓
Relevant PDF Chunks
   ↓
OpenAI (RAG Prompt)
   ↓
Final Answer

```

---

## 📂 Project Structure
```sh
pdf-chat-assistant/
│
├── client/                 # Next.js frontend
│   ├── app/
│   ├── components/
│   └── public/
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── consumer.ts     # RabbitMQ worker
│   │   ├── server.ts
│   │   └── qdrantClient.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── LICENSE

```
---

## ▶️ Getting Started

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/pdf-chat-assistant.git
cd pdf-chat-assistant
```

### 🐳 Docker Services Configuration
The following services are defined in server/docker-compose.yml:
```sh
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"

```

### ▶️ Running Infrastructure Services
Before starting the backend server, start Docker services:
```sh
cd server
docker-compose up -d
```

#### Service URLs

RabbitMQ Management UI:
```sh
http://localhost:15672
```
Username: admin
Password: admin
<br/>
#### Qdrant API:
```sh
http://localhost:6333
```

<br/>

### 2️⃣ Start Backend
```sh
cd backend
pnpm install
pnpm dev
```

### Start message queue worker (consumer.ts)
```sh
pnpm dev:consumer
```

Server runs on:
```sh
http://localhost:8000
```

### 3️⃣ Start Frontend
```sh
cd frontend
pnpm install
pnpm dev
```

App runs on:
```sh
http://localhost:3000
```

---

## 🧪 Example Use Cases

- Ask questions from lecture notes

- Query technical documentation

- Understand research papers

- Build internal knowledge assistants

- PDF-based Q&A systems

  ----

## 📈 Future Enhancements

- 🔗 Answer citations with page numbers

- 🗂️ Multiple PDF support

- 🧵 Chat history persistence

- 🌙 Dark mode

- ⚡ Streaming responses

- 🔐 Authentication & user sessions

---

#### 👨‍💻 Author
##### Rashim Sunar
MERN Stack Developer | AI & System Design Enthusiast


