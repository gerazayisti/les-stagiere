import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Durée du timeout en millisecondes (30 minutes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const SESSION_ACTIVITY_KEY = 'last_activity_timestamp';

interface SessionTimeoutContextType {
  resetTimer: () => void;
  remainingTime: number;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export const useSessionTimeout = () => {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error('useSessionTimeout doit être utilisé à l\'intérieur d\'un SessionTimeoutProvider');
  }
  return context;
};

export const SessionTimeoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [lastActivity, setLastActivity] = useState<number>(() => {
    // Initialiser depuis localStorage si disponible
    const storedTimestamp = localStorage.getItem(SESSION_ACTIVITY_KEY);
    return storedTimestamp ? parseInt(storedTimestamp, 10) : Date.now();
  });
  const [remainingTime, setRemainingTime] = useState(INACTIVITY_TIMEOUT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Réinitialiser le timer d'inactivité - utiliser useCallback pour éviter les recréations
  const resetTimer = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem(SESSION_ACTIVITY_KEY, now.toString());
    setRemainingTime(INACTIVITY_TIMEOUT);
  }, []);

  // Configurer les écouteurs d'événements pour l'activité utilisateur
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];

    const handleUserActivity = () => {
      resetTimer();
    };

    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initialiser le timer
    resetTimer();

    // Nettoyage
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user, resetTimer]); // Ajouter resetTimer comme dépendance

  // Vérifier l'inactivité et mettre à jour le temps restant
  useEffect(() => {
    if (!user) return;

    // Nettoyer l'ancien timer avant d'en créer un nouveau
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const intervalTimer = setInterval(() => {
      const now = Date.now();
      const timeElapsed = now - lastActivity;
      const timeRemaining = Math.max(0, INACTIVITY_TIMEOUT - timeElapsed);
      
      setRemainingTime(timeRemaining);
      
      if (timeElapsed >= INACTIVITY_TIMEOUT) {
        console.log('Session expirée en raison d\'inactivité');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        signOut();
      }
    }, 1000); // Vérifier chaque seconde

    timerRef.current = intervalTimer;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user, lastActivity, signOut]); // Ajouter toutes les dépendances nécessaires

  return (
    <SessionTimeoutContext.Provider value={{ resetTimer, remainingTime }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
};
