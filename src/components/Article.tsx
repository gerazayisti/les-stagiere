import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface ArticleProps {
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
  tags: string[];
}

export function Article({
  title,
  description,
  image,
  author,
  date,
  readTime,
  slug,
  tags,
}: ArticleProps) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex gap-2 flex-wrap mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
          <Link to={`/blog/${slug}`}>{title}</Link>
        </h2>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{author}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays size={16} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{readTime}</span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/blog/${slug}`}>Lire l'article</Link>
        </Button>
      </div>
    </Card>
  );
}
