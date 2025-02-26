import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  Crown,
  Star,
  Zap,
  Users,
  MessageSquare,
  FileText,
  Briefcase,
  ThumbsUp,
} from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    price: "0 FCFA",
    description: "Pour commencer votre recherche de stage",
    icon: Star,
    features: [
      "Profil de base",
      "Recherche de stages",
      "Candidatures illimitées",
      "CV simple",
      "3 messages par jour",
    ],
    limitations: [
      "CV interactif limité",
      "Portfolio limité",
      "Pas de recommandations",
      "Pas de mise en avant du profil",
    ],
    buttonText: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Premium",
    price: "5000 FCFA/mois",
    description: "Pour les stagiaires ambitieux",
    icon: Crown,
    features: [
      "Tout du plan Gratuit",
      "CV interactif complet",
      "Portfolio personnalisé",
      "Recommandations",
      "Messages illimités",
      "Mise en avant du profil",
      "Badges de compétences",
      "Statistiques de profil",
      "Support prioritaire",
    ],
    buttonText: "Devenir Premium",
    popular: true,
    savings: "Économisez 20% avec un abonnement annuel",
  },
  {
    name: "Business",
    price: "10000 FCFA/mois",
    description: "Pour les professionnels",
    icon: Zap,
    features: [
      "Tout du plan Premium",
      "Coaching personnalisé",
      "Revue de CV par des experts",
      "IA cv analyser",
      "Accès aux événements exclusifs",
      "Formations premium",
      "Réseau d'alumni",
      "Opportunités VIP",
    ],
    buttonText: "Contacter les ventes",
    popular: false,
  },
];

const featureIcons = {
  "CV interactif complet": FileText,
  "Portfolio personnalisé": Briefcase,
  "Recommandations": ThumbsUp,
  "Messages illimités": MessageSquare,
  "Mise en avant du profil": Users,
};

export default function Abonnement() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choisissez votre plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Débloquez tout votre potentiel avec nos plans premium et accédez à des
          fonctionnalités exclusives pour booster votre recherche de stage.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <Card
              key={plan.name}
              className={`relative p-8 ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`p-3 rounded-lg ${
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-3xl font-bold">{plan.price}</p>
                {plan.savings && (
                  <p className="text-sm text-primary mt-2">{plan.savings}</p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => {
                  const FeatureIcon = featureIcons[feature] || Check;

                  return (
                    <div key={feature} className="flex items-center gap-3">
                      <FeatureIcon className="w-5 h-5 text-primary" />
                      <span>{feature}</span>
                    </div>
                  );
                })}

                {plan.limitations && (
                  <div className="pt-4 mt-4 border-t border-border">
                    {plan.limitations.map((limitation) => (
                      <div
                        key={limitation}
                        className="flex items-center gap-3 text-muted-foreground"
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          ✕
                        </span>
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.buttonText}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Questions fréquentes
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">
              Comment fonctionne la période d'essai ?
            </h3>
            <p className="text-muted-foreground">
              Vous bénéficiez de 14 jours d'essai gratuit pour tester toutes les
              fonctionnalités premium. Aucun engagement, vous pouvez annuler à
              tout moment.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              Puis-je changer de plan à tout moment ?
            </h3>
            <p className="text-muted-foreground">
              Oui, vous pouvez upgrader ou downgrader votre plan à tout moment.
              La différence sera calculée au prorata.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              Comment fonctionne le remboursement ?
            </h3>
            <p className="text-muted-foreground">
              Si vous n'êtes pas satisfait, nous vous remboursons intégralement
              dans les 30 jours suivant votre abonnement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
