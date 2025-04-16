import { useState, useEffect } from 'react';
import { useSessionTimeout } from '@/contexts/SessionTimeoutContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SessionTimeoutWarning() {
  const { remainingTime, resetTimer } = useSessionTimeout();
  const [showWarning, setShowWarning] = useState(false);
  
  // Afficher l'avertissement quand il reste 2 minutes
  const WARNING_THRESHOLD = 2 * 60 * 1000;

  useEffect(() => {
    // Afficher l'avertissement quand il reste moins de 2 minutes
    if (remainingTime <= WARNING_THRESHOLD && remainingTime > 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [remainingTime]);

  const handleContinueSession = () => {
    resetTimer();
    setShowWarning(false);
    toast.success('Votre session a été prolongée');
  };

  // Formater le temps restant en minutes et secondes
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-amber-500 max-w-md z-50">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Votre session va expirer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Vous serez déconnecté dans {formatTime(remainingTime)} en raison d'inactivité.
            </p>
          </div>
        </div>
        <Button onClick={handleContinueSession} className="w-full">
          Continuer ma session
        </Button>
      </div>
    </div>
  );
}
