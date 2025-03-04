
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PartnerProps {
  name: string;
  logo: string;
  delay?: number;
}

const Partner = ({ name, logo, delay = 0 }: PartnerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center justify-center p-4"
    >
      <div className="w-24 h-24 md:w-32 md:h-32 bg-white/90 shadow-sm rounded-lg flex items-center justify-center p-4 mb-2">
        <img 
          src={logo} 
          alt={`${name} logo`} 
          className="max-w-full max-h-full object-contain" 
        />
      </div>
      <span className="text-sm font-medium text-center">{name}</span>
    </motion.div>
  );
};

interface PartnersListProps {
  className?: string;
}

export const PartnersList = ({ className }: PartnersListProps) => {
  const partners = [
    { name: 'TechCorp', logo: '/partners/techcorp.png' },
    { name: 'InnoVision', logo: '/partners/innovision.png' },
    { name: 'GlobalLearn', logo: '/partners/globallearn.png' },
    { name: 'FutureWorks', logo: '/partners/futureworks.png' },
    { name: 'EduTech', logo: '/partners/edutech.png' },
    { name: 'NextGen', logo: '/partners/nextgen.png' },
  ];

  return (
    <div className={cn("w-full py-12", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-semibold text-foreground mb-8 text-center"
        >
          Nos partenaires
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          Nous collaborons avec des entreprises de premier plan pour offrir les meilleures opportunités de stage à nos utilisateurs.
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <Partner 
              key={partner.name} 
              name={partner.name} 
              logo={partner.logo} 
              delay={index * 0.1} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
