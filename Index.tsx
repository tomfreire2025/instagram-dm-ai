import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "@/components/ConversationList";
import { MessageThread } from "@/components/MessageThread";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useToast } from "@/hooks/use-toast";
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

interface AIConfig {
  auto_respond: boolean;
  system_prompt: string;
  auto_welcome: boolean;
  welcome_message: string;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    auto_respond: false,
    system_prompt: "You are a helpful Instagram DM assistant. Respond professionally and concisely to messages.",
    auto_welcome: true,
    welcome_message: "Olá! 👋 Muito obrigado por me seguir! Estou aqui para ajudar. Como posso te ajudar hoje?",
  });
  const { toast } = useToast();

  // Fetch conversations
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      return;
    }

    setConversations(data || []);
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
      return;
    }

    setMessages(data || []);
  };

  // Fetch AI config
  const fetchAIConfig = async () => {
    const { data, error } = await supabase.from("ai_config").select("*").single();

    if (error) {
      console.error("Error fetching AI config:", error);
      return;
    }

    if (data) {
      setAIConfig({
        auto_respond: data.auto_respond,
        system_prompt: data.system_prompt,
        auto_welcome: data.auto_welcome ?? true,
        welcome_message: data.welcome_message ?? "Olá! 👋 Muito obrigado por me seguir!",
      });
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchAIConfig();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    } else {
      setMessages([]);
    }
  }, [selectedConvId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const conversationsChannel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.new && (payload.new as any).conversation_id === selectedConvId) {
            fetchMessages(selectedConvId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedConvId]);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-instagram flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-instagram bg-clip-text text-transparent">
                Instagram DM AI
              </h1>
              <p className="text-sm text-muted-foreground">
                Automated Instagram message responder
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
              {/* Conversations List */}
              <Card className="lg:col-span-1 shadow-card overflow-hidden">
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConvId}
                  onSelect={setSelectedConvId}
                />
              </Card>

              {/* Message Thread */}
              <Card className="lg:col-span-2 shadow-card overflow-hidden">
                {selectedConvId ? (
                  <MessageThread
                    messages={messages}
                    conversationTitle={selectedConversation?.title}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Sparkles className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Select a conversation from the list to view messages and AI responses
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card className="max-w-2xl mx-auto shadow-card">
            <SettingsPanel 
              autoRespond={aiConfig.auto_respond}
              systemPrompt={aiConfig.system_prompt}
              autoWelcome={aiConfig.auto_welcome}
              welcomeMessage={aiConfig.welcome_message}
              onUpdate={fetchAIConfig}
            />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
