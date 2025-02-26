import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "./Badge";
import { Star, Quote } from "lucide-react";

interface Recommendation {
  id: string;
  author: {
    name: string;
    position: string;
    company: string;
    avatar: string;
  };
  content: string;
  rating: number;
  date: string;
}

interface RecommendationsProps {
  isPremium: boolean;
}

export function Recommendations({ isPremium }: RecommendationsProps) {
  const recommendations: Recommendation[] = [
    {
      id: "1",
      author: {
        name: "Marie Nguemo",
        position: "Directrice RH",
        company: "Tech Solutions Cameroun",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      },
      content:
        "Un excellent stagiaire avec une grande capacité d'apprentissage et d'adaptation. A démontré une forte expertise technique et une excellente communication avec l'équipe.",
      rating: 5,
      date: "Février 2025",
    },
    {
      id: "2",
      author: {
        name: "Paul Biya",
        position: "Lead Developer",
        company: "Digital Africa Inc",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Paul",
      },
      content:
        "Très professionnel et proactif. A apporté des solutions innovantes à plusieurs défis techniques majeurs pendant son stage.",
      rating: 5,
      date: "Janvier 2025",
    },
  ];

  if (!isPremium) {
    return (
      <Card className="p-6 text-center">
        <Quote className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          Recommandations Premium
        </h3>
        <p className="text-muted-foreground mb-4">
          Passez à un abonnement premium pour recevoir des recommandations
          de vos anciens employeurs et superviseurs.
        </p>
        <Badge type="premium" className="mx-auto" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recommandations</h3>
        <Badge type="premium" />
      </div>

      <div className="grid gap-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={recommendation.author.avatar} />
                <AvatarFallback>
                  {recommendation.author.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">
                      {recommendation.author.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.author.position} chez{" "}
                      {recommendation.author.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: recommendation.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-500 text-yellow-500"
                      />
                    ))}
                  </div>
                </div>
                <blockquote className="text-muted-foreground border-l-2 pl-4 my-4">
                  {recommendation.content}
                </blockquote>
                <p className="text-sm text-muted-foreground">
                  {recommendation.date}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
