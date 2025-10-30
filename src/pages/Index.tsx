import { useState, useEffect } from "react";
import { MessageSquare, Settings, Sparkles } from "lucide-react";

interface Conversation {
  id: string;
  chat_id: string;
  title: string;
  last_message_at: string | null;
  account_id: string | null;
}

interface Message {
  id: string;
  message_text: string | null;
  ai_response: string | null;
  is_from_user: boolean;
  status: string;
  created_at: string;
  sender_name: string | null;
}

const Index = () => {
  const [conversations] = useState<Conversation[]>([]);
  const [messages] = useState<Message[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Instagram DM AI
              </h1>
              <p className="text-sm text-gray-600">
                Automated Instagram message responder
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Sparkles className="h-16 w-16 text-white mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold text-white mb-2">Welcome to Instagram DM AI</h3>
          <p className="text-white/80 max-w-sm">
            Your automated Instagram message responder is ready to go!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
