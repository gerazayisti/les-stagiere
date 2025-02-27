
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2, Camera, PenSquare, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

interface AvatarUploadProps {
  imageUrl?: string;
  username?: string;
  size?: "sm" | "md" | "lg";
  onChange?: (url: string) => void;
  onDelete?: () => void;
  className?: string;
}

export function AvatarUpload({
  imageUrl,
  username,
  size = "md",
  onChange,
  onDelete,
  className,
}: AvatarUploadProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const dimensions = {
    sm: "h-12 w-12",
    md: "h-20 w-20", 
    lg: "h-32 w-32",
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image doit faire moins de 2MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Si un avatar existant doit être supprimé
      if (imageUrl && imageUrl.includes("public") && !imageUrl.includes("ui-avatars.com")) {
        try {
          await auth.deleteAvatar(imageUrl);
        } catch (error) {
          console.error("Erreur lors de la suppression de l'avatar :", error);
        }
      }

      // Upload du nouvel avatar
      if (user?.id) {
        const newImageUrl = await auth.uploadAvatar(file, user.id);
        if (onChange) {
          onChange(newImageUrl);
        }

        toast({
          title: "Avatar mis à jour",
          description: "Votre avatar a été mis à jour avec succès",
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!imageUrl || !onDelete) return;

    setIsLoading(true);
    try {
      if (imageUrl.includes("public") && !imageUrl.includes("ui-avatars.com")) {
        await auth.deleteAvatar(imageUrl);
      }
      onDelete();
      toast({
        title: "Avatar supprimé",
        description: "Votre avatar a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div
        className={`relative inline-block ${isLoading ? "opacity-50" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Avatar className={`${dimensions[size]} cursor-pointer`} onClick={handleClick}>
          <AvatarImage src={imageUrl} alt={username || "Avatar"} />
          <AvatarFallback>
            {username ? getInitials(username) : <User2 className={iconSize[size]} />}
          </AvatarFallback>
        </Avatar>

        {isHovering && !isLoading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Camera className="text-white" />
              {size === "lg" && <span className="text-white text-xs mt-1">Modifier</span>}
            </div>
          </div>
        )}

        {size === "lg" && imageUrl && onDelete && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {size === "lg" && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-2 -left-2 h-8 w-8 rounded-full"
            onClick={handleClick}
            disabled={isLoading}
          >
            <PenSquare className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}
