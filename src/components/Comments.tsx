import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  replies: number;
  date: string;
  isLiked: boolean;
}

interface CommentsProps {
  articleId: string;
}

export function Comments({ articleId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      user: {
        name: "Alice Dubois",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
      content: "Excellent article ! Les informations sur les stages au Cameroun sont très utiles.",
      likes: 12,
      replies: 2,
      date: "Il y a 2 heures",
      isLiked: false,
    },
    {
      id: "2",
      user: {
        name: "Marc Kameni",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marc",
      },
      content: "Je peux confirmer ces tendances. En tant que recruteur, nous recherchons de plus en plus ces compétences.",
      likes: 8,
      replies: 1,
      date: "Il y a 3 heures",
      isLiked: false,
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
        };
      }
      return comment;
    }));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: "Utilisateur",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
      },
      content: newComment,
      likes: 0,
      replies: 0,
      date: "À l'instant",
      isLiked: false,
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold mb-6">Commentaires ({comments.length})</h3>
      
      {/* Add Comment */}
      <div className="mb-8">
        <Textarea
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleAddComment}>Publier</Button>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{comment.user.name}</span>
                <span className="text-sm text-muted-foreground">{comment.date}</span>
              </div>
              <p className="text-sm mb-3">{comment.content}</p>
              <div className="flex gap-4">
                <button
                  className={`flex items-center gap-1 text-sm ${
                    comment.isLiked ? "text-red-500" : "text-muted-foreground"
                  }`}
                  onClick={() => handleLike(comment.id)}
                >
                  <Heart size={16} className={comment.isLiked ? "fill-current" : ""} />
                  <span>{comment.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle size={16} />
                  <span>{comment.replies}</span>
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Share2 size={16} />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
