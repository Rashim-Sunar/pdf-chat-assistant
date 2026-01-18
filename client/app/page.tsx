import FileUploadComponent from '@/components/file-upload';
import ChatBot from '@/components/chat-bot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">

        {/* Left – PDF Upload */}
        <section className="flex items-center justify-center">
          <FileUploadComponent />
        </section>

        {/* Right – Chatbot */}
        <section className="flex items-center justify-center">
          <ChatBot />
        </section>

      </div>
    </main>
  );
}
