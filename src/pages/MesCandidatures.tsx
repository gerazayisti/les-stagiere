import React from 'react';
import { CandidaturesList } from '@/components/candidatures/CandidaturesList';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileSearch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MesCandidatures: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Candidatures</h1>
          <Link to="/offres-stages">
            <Button variant="outline">
              Voir les offres de stage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {user.role === 'stagiaire' ? (
          <CandidaturesList />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
            <p className="text-gray-600 mb-4">
              Seuls les stagiaires peuvent accéder à la liste des candidatures.
            </p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesCandidatures;
