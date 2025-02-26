import { motion } from "framer-motion";

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const TargetAudience = () => {
  return (
    <section className="py-16 bg-muted px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial="hidden"
          animate="visible"
          variants={slideUp}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-foreground mb-8 text-center"
        >
          Notre Public Cible
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-lg bg-background border border-border"
          >
            <h3 className="text-xl font-semibold mb-4">Entreprises</h3>
            <p className="text-muted-foreground">
              Des startups aux grandes entreprises, nous accompagnons tous types d'organisations dans leur recherche de talents.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-6 rounded-lg bg-background border border-border"
          >
            <h3 className="text-xl font-semibold mb-4">Institutions Étatiques</h3>
            <p className="text-muted-foreground">
              Mairies, ministères et autres institutions gouvernementales peuvent trouver les stagiaires qualifiés dont ils ont besoin.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-6 rounded-lg bg-background border border-border"
          >
            <h3 className="text-xl font-semibold mb-4">Organismes Internationaux</h3>
            <p className="text-muted-foreground">
              ONGs et organisations internationales peuvent recruter des stagiaires locaux pour leurs projets.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
