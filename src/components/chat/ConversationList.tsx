import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: "online" | "offline";
  };
  lastMessage: {
    text: string;
    time: string;
    unread: boolean;
  };
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated conversations data
  const conversations: Conversation[] = [
    {
      id: "1",
      user: {
        name: "Tech Startup Sarl",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company1",
        status: "online",
      },
      lastMessage: {
        text: "Nous avons examiné votre candidature...",
        time: "14:30",
        unread: true,
      },
    },
    {
      id: "2",
      user: {
        name: "Digital Africa Inc",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company2",
        status: "offline",
      },
      lastMessage: {
        text: "Merci pour votre message. Pouvons-nous...",
        time: "Hier",
        unread: false,
      },
    },
    {
      id: "3",
      user: {
        name: "Innovation Lab",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company3",
        status: "online",
      },
      lastMessage: {
        text: "Le stage commence le 1er mars...",
        time: "Hier",
        unread: false,
      },
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-sm border-r">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="divide-y">
        {filteredConversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant="ghost"
            className={`w-full justify-start p-4 h-auto ${
              selectedConversationId === conversation.id ? "bg-muted" : ""
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conversation.user.avatar} />
                  <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                    conversation.user.status === "online"
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium truncate">
                    {conversation.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {conversation.lastMessage.time}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.text}
                  </p>
                  {conversation.lastMessage.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
