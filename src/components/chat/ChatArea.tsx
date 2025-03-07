
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Image as ImageIcon, File, MoreHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  sender: "user" | "other";
  content: string;
  time: string;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
}

interface ChatAreaProps {
  conversationId: string;
  recipient: {
    name: string;
    avatar: string;
    status: "online" | "offline";
  };
}

export function ChatArea({ conversationId, recipient }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "other",
      content: "Bonjour ! Nous avons bien reçu votre candidature pour le stage.",
      time: "14:30",
      type: "text",
    },
    {
      id: "2",
      sender: "other",
      content: "Voici le descriptif détaillé du poste",
      time: "14:31",
      type: "file",
      fileUrl: "#",
      fileName: "stage_description.pdf",
    },
    {
      id: "3",
      sender: "user",
      content: "Merci beaucoup ! J'ai hâte d'en discuter avec vous.",
      time: "14:35",
      type: "text",
    },
    {
      id: "4",
      sender: "other",
      content: "Êtes-vous disponible pour un entretien en ligne la semaine prochaine ?",
      time: "14:40",
      type: "text",
    },
    {
      id: "5",
      sender: "user",
      content: "Oui, je suis disponible lundi ou mardi après-midi. Qu'est-ce qui vous convient le mieux ?",
      time: "14:45",
      type: "text",
    },
    {
      id: "6",
      sender: "other",
      content: "Parfait ! Disons mardi à 14h. Je vous envoie une invitation par email.",
      time: "15:00",
      type: "text",
    },
    {
      id: "7",
      sender: "other",
      content: "Voici mon CV mis à jour avec mes dernières expériences",
      time: "15:05",
      type: "file",
      fileUrl: "#",
      fileName: "cv_updated.pdf",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const conversationParam = queryParams.get('conversation');
    
    if (conversationParam && conversationParam === conversationId) {
      const systemMessage: Message = {
        id: Date.now().toString(),
        sender: "other",
        content: "La candidature est maintenant en discussion. Vous pouvez échanger des informations supplémentaires ici.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };
      
      if (!messages.some(msg => msg.content === systemMessage.content)) {
        setMessages(prevMessages => [...prevMessages, systemMessage]);
      }
    }
  }, [location.search, conversationId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (type: "file" | "image") => {
    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: type === "image" ? "Image envoyée" : "Fichier envoyé",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type,
      fileUrl: "#",
      fileName: type === "image" ? "photo.jpg" : "document.pdf",
    };

    setMessages([...messages, message]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={recipient.avatar} />
              <AvatarFallback>{recipient.name[0]}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                recipient.status === "online" ? "bg-green-500" : "bg-muted"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold">{recipient.name}</h3>
            <p className="text-xs text-muted-foreground">
              {recipient.status === "online" ? "En ligne" : "Hors ligne"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Voir le profil</DropdownMenuItem>
            <DropdownMenuItem>Archiver la conversation</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Supprimer la conversation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                } rounded-lg p-3`}
              >
                {message.type === "text" ? (
                  <p>{message.content}</p>
                ) : message.type === "file" ? (
                  <a
                    href={message.fileUrl}
                    className="flex items-center gap-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <File className="h-4 w-4" />
                    {message.fileName}
                  </a>
                ) : (
                  <a
                    href={message.fileUrl}
                    className="flex items-center gap-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {message.fileName}
                  </a>
                )}
                <div
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFileUpload("file")}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFileUpload("image")}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
