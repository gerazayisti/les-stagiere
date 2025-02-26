import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Paperclip } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface ChatDiscussionProps {
  candidatureId: number;
  entreprise: {
    id: string;
    name: string;
    avatar?: string;
  };
  candidat: {
    id: string;
    name: string;
    avatar?: string;
  };
  onClose: () => void;
}

export function ChatDiscussion({
  candidatureId,
  entreprise,
  candidat,
  onClose,
}: ChatDiscussionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour, nous avons examiné votre candidature avec intérêt.",
      sender: entreprise,
      timestamp: new Date(2024, 1, 20, 14, 30),
    },
    {
      id: "2",
      content: "Merci pour votre retour ! Je suis disponible pour un entretien.",
      sender: candidat,
      timestamp: new Date(2024, 1, 20, 15, 45),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: candidat, // ou entreprise selon le contexte
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      // Simuler un upload de fichier
      setTimeout(() => {
        const message: Message = {
          id: Date.now().toString(),
          content: "Document partagé",
          sender: candidat, // ou entreprise selon le contexte
          timestamp: new Date(),
          attachments: Array.from(files).map((file) => ({
            id: Math.random().toString(),
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
          })),
        };
        setMessages([...messages, message]);
        setIsUploading(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={entreprise.avatar} />
            <AvatarFallback>{entreprise.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{entreprise.name}</h3>
            <p className="text-sm text-gray-500">Discussion de candidature</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isSender = message.sender.id === candidat.id;
            return (
              <div
                key={message.id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[70%] ${
                    isSender ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        isSender
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.attachments?.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-2 text-sm underline"
                        >
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {format(message.timestamp, "HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
