import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  delay?: number;
  isPopular?: boolean;
}

export const PricingCard = ({ title, price, features, delay = 0, isPopular = false }: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`p-6 rounded-lg ${
        isPopular ? "border-2 border-primary" : "border border-border"
      } bg-background relative`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
          Populaire
        </span>
      )}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <div className="text-3xl font-bold text-foreground mb-6">{price}</div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-muted-foreground">
            <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/inscription"
        className={`block w-full py-2 px-4 rounded-lg text-center transition-colors ${
          isPopular
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-foreground hover:bg-muted/90"
        }`}
      >
        S'inscrire
      </Link>
    </motion.div>
  );
};
