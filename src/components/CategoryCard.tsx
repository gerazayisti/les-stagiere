
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/Icons';

export interface CategoryCardProps {
  title: string;
  icon: string;
  count?: number; // Ajout du count comme optionnel pour corriger l'erreur
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, count }) => {
  // Fonction pour récupérer dynamiquement l'icône selon le nom
  const IconComponent = Icons[icon as keyof typeof Icons] || Icons.default;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center bg-primary/10 rounded-md w-12 h-12">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{title}</h3>
            {count !== undefined && (
              <p className="text-sm text-muted-foreground">{count} offres</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
