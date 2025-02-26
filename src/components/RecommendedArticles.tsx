import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface RecommendedArticle {
  slug: string;
  title: string;
  image: string;
  description: string;
}

interface RecommendedArticlesProps {
  currentSlug: string;
  articles: RecommendedArticle[];
}

export function RecommendedArticles({ currentSlug, articles }: RecommendedArticlesProps) {
  // Filter out the current article and get only 3 recommendations
  const recommendations = articles
    .filter((article) => article.slug !== currentSlug)
    .slice(0, 3);

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-semibold mb-6">Articles recommandés</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((article) => (
          <Card key={article.slug} className="overflow-hidden group">
            <Link to={`/blog/${article.slug}`}>
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.description}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
