
import { useState, useEffect } from "react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatArea } from "@/components/chat/ChatArea";
import { MessageSquare, MessageCircle, Search, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";

// Simulated recipient data
const recipients = {
  "1": {
    name: "Tech Startup Sarl",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company1",
    status: "online" as const,
  },
  "2": {
    name: "Digital Africa Inc",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company2",
    status: "offline" as const,
  },
  "3": {
    name: "Innovation Lab",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company3",
    status: "online" as const,
  },
};

export default function Messagerie() {
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [hasMessages, setHasMessages] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Check if there's a conversationId in the URL parameters
  useEffect(() => {
    const conversationId = searchParams.get("id");
    if (conversationId && Object.keys(recipients).includes(conversationId)) {
      setSelectedConversationId(conversationId);
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-8rem)]">
            <ConversationList
              onSelectConversation={setSelectedConversationId}
              selectedConversationId={selectedConversationId}
              onEmptyConversations={(empty) => setHasMessages(!empty)}
            />
            {selectedConversationId ? (
              <div className="flex-1">
                <ChatArea
                  conversationId={selectedConversationId}
                  recipient={recipients[selectedConversationId as keyof typeof recipients]}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
                {hasMessages ? (
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mb-4 text-muted mx-auto" />
                    <h3 className="text-lg font-medium mb-1">Sélectionnez une conversation</h3>
                    <p className="text-sm max-w-md">
                      Choisissez une conversation dans la liste pour afficher les messages.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mb-4 text-muted mx-auto" />
                    <h3 className="text-lg font-medium mb-1">Aucun message</h3>
                    <p className="text-sm text-center max-w-md">
                      Vous n'avez pas encore de messages. Les messages apparaîtront ici lorsque vous commencerez une conversation.
                    </p>
                    <div className="mt-6">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Users className="h-4 w-4" />
                        <span>Rechercher des contacts pour démarrer une conversation</span>
                      </div>
                      <div className="mt-4 relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text"
                          placeholder="Rechercher un utilisateur ou une entreprise..." 
                          className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
