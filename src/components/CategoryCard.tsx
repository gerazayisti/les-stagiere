import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  vacancies: number;
  delay?: number;
}

export const CategoryCard = ({ title, vacancies, delay = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <Link
        to={`/stages/categorie/${title.toLowerCase()}`}
        className="block p-4 rounded-lg border border-border bg-background hover:border-primary transition-colors"
      >
        <h3 className="text-foreground font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {vacancies} {vacancies === 1 ? "Offre" : "Offres"}
        </p>
      </Link>
    </motion.div>
  );
};
