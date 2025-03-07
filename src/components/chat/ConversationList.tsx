
import { useState, useEffect } from "react";
import { Search, UserRound, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  recipient: {
    name: string;
    avatar: string;
    status: "online" | "offline";
  };
  lastMessage: {
    text: string;
    time: string;
    isRead: boolean;
  };
}

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedConversationId?: string;
  onEmptyConversations?: (empty: boolean) => void;
}

export function ConversationList({
  onSelectConversation,
  selectedConversationId,
  onEmptyConversations,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      recipient: {
        name: "Tech Startup Sarl",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company1",
        status: "online",
      },
      lastMessage: {
        text: "Bonjour ! Nous avons bien reçu votre candidature pour le stage.",
        time: "14:30",
        isRead: false,
      },
    },
    {
      id: "2",
      recipient: {
        name: "Digital Africa Inc",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company2",
        status: "offline",
      },
      lastMessage: {
        text: "Merci pour votre candidature. Pouvons-nous prévoir un entretien ?",
        time: "Hier",
        isRead: true,
      },
    },
    {
      id: "3",
      recipient: {
        name: "Innovation Lab",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company3",
        status: "online",
      },
      lastMessage: {
        text: "Votre profil nous intéresse, pouvez-vous nous envoyer plus d'informations ?",
        time: "Lun",
        isRead: true,
      },
    },
    {
      id: "4",
      recipient: {
        name: "CodeLab Technologies",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company4",
        status: "online",
      },
      lastMessage: {
        text: "Nous avons analysé votre CV et souhaitons en discuter avec vous",
        time: "Mar",
        isRead: true,
      },
    },
    {
      id: "5",
      recipient: {
        name: "Global Solutions",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=company5",
        status: "offline",
      },
      lastMessage: {
        text: "Félicitations! Votre candidature a été acceptée.",
        time: "Aujourd'hui",
        isRead: false,
      },
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredConversations = conversations.filter((conversation) =>
    conversation.recipient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Notify parent component about empty conversations
  useEffect(() => {
    if (onEmptyConversations) {
      onEmptyConversations(conversations.length === 0);
    }
  }, [conversations, onEmptyConversations]);

  return (
    <div className="w-80 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
          <Plus className="h-4 w-4" /> Nouvelle conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full p-3 text-left flex items-start space-x-3 hover:bg-muted/50 transition-colors ${
                  selectedConversationId === conversation.id
                    ? "bg-muted"
                    : ""
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.recipient.avatar} />
                    <AvatarFallback>
                      {conversation.recipient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                      conversation.recipient.status === "online"
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">
                      {conversation.recipient.name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {conversation.lastMessage.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <p
                      className={`text-xs truncate ${
                        !conversation.lastMessage.isRead
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {conversation.lastMessage.text}
                    </p>
                    {!conversation.lastMessage.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 px-4 text-center">
              <UserRound className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucune conversation trouvée
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
