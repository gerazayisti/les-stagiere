import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RequireProfileCompletionProps {
  children: ReactNode;
}

export function RequireProfileCompletion({ children }: RequireProfileCompletionProps) {
  const { user, userRole, loading: authLoading } = useAuth();
  const { isComplete, loading: profileLoading, userId, userRole: profileUserRole } = useProfileCompletion();

  // Si l'authentification est en cours de chargement
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Si le profil n'est pas complet et que nous ne sommes pas déjà sur la page de complétion
  if (!isComplete && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
