
import { useState } from "react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatArea } from "@/components/chat/ChatArea";
import { MessageSquare } from "lucide-react";

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
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [hasMessages, setHasMessages] = useState<boolean>(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
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
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              {hasMessages ? (
                "Sélectionnez une conversation pour commencer"
              ) : (
                <>
                  <MessageSquare className="h-12 w-12 mb-4 text-muted" />
                  <h3 className="text-lg font-medium mb-1">Aucun message</h3>
                  <p className="text-sm text-center max-w-md">
                    Vous n'avez pas encore de messages. Les messages apparaîtront ici lorsque vous commencerez une conversation.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
