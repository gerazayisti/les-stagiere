import { motion } from "framer-motion";
import { PricingCard } from "./PricingCard";

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

interface PricingPlan {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  type: "stagiaire" | "entreprise";
}

export const Pricing = () => {
  const pricing: PricingPlan[] = [
    {
      title: "Pack Standard - Gratuit",
      price: "Gratuit",
      features: ["Accès aux offres d'emploi"],
      type: "stagiaire"
    },
    {
      title: "Pack Premium - 10 000 FCFA",
      price: "10 000 FCFA",
      features: [
        "Mise en avant du profil",
        "Accès aux offres exclusives",
        "Notifications en temps réel",
        "Optimisation du CV",
        "Statistiques de visibilité",
        "Accès aux ressources et conseils"
      ],
      isPopular: true,
      type: "stagiaire"
    },
    {
      title: "Abonnement Annuel Entreprise",
      price: "50 000 FCFA",
      features: [
        "Accès illimité aux profils",
        "Visibilité accrue",
        "Alertes personnalisées",
        "Support prioritaire"
      ],
      type: "entreprise"
    },
    {
      title: "Paiement à la Demande",
      price: "Sur devis",
      features: [
        "Recrutement de stagiaires occasionnels",
        "Stages de vacances ou professionnels",
        "Campagnes marketing",
        "Campagnes publicitaires",
        "Sondages d'entreprise"
      ],
      type: "entreprise"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial="hidden"
          animate="visible"
          variants={slideUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-foreground mb-8 text-center"
        >
          Nos Offres
        </motion.h2>
        
        {/* Stagiaires */}
        <motion.h3
          initial="hidden"
          animate="visible"
          variants={slideUp}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-foreground mb-6 mt-12"
        >
          Pour les Stagiaires
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {pricing.filter(pack => pack.type === "stagiaire").map((pack, index) => (
            <PricingCard
              key={pack.title}
              title={pack.title}
              price={pack.price}
              features={pack.features}
              isPopular={pack.isPopular}
              delay={0.2 * index}
            />
          ))}
        </div>

        {/* Entreprises */}
        <motion.h3
          initial="hidden"
          animate="visible"
          variants={slideUp}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-foreground mb-6"
        >
          Pour les Entreprises et Institutions
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricing.filter(pack => pack.type === "entreprise").map((pack, index) => (
            <PricingCard
              key={pack.title}
              title={pack.title}
              price={pack.price}
              features={pack.features}
              delay={0.2 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
