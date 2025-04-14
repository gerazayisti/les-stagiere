import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function useSessionTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
  // Function to reset the timeout
  const resetTimeout = () => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = setTimeout(async () => {
      console.log('Session timeout: logging out user due to inactivity');
      
      // Show notification
      toast.warning('Session expirée', {
        description: 'Vous avez été déconnecté en raison d\'une inactivité prolongée'
      });
      
      // Sign out using Supabase directly
      try {
        await supabase.auth.signOut();
        
        // Clear local storage items related to session
        localStorage.removeItem('app_session_cache');
        localStorage.removeItem('navigation_state');
        
        // Reload the page to ensure clean state
        window.location.href = '/connexion';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }, SESSION_TIMEOUT);
  };
  
  // Set up event listeners for user activity
  useEffect(() => {
    // List of events that indicate user activity
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];
    
    // Initial timeout setup
    resetTimeout();
    
    // Event handler for user activity
    const activityHandler = () => {
      resetTimeout();
    };
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, activityHandler);
    });
    
    // Periodic check for inactivity (every minute)
    const checkInterval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      
      // If inactive for more than the timeout period, log out
      if (inactiveTime >= SESSION_TIMEOUT) {
        console.log('Session timeout detected during interval check');
        
        // Sign out using Supabase directly
        supabase.auth.signOut().then(() => {
          toast.warning('Session expirée', {
            description: 'Vous avez été déconnecté en raison d\'une inactivité prolongée'
          });
          
          // Clear local storage items related to session
          localStorage.removeItem('app_session_cache');
          localStorage.removeItem('navigation_state');
          
          // Reload the page to ensure clean state
          window.location.href = '/connexion';
        });
      }
    }, 60000); // Check every minute
    
    // Clean up event listeners on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      clearInterval(checkInterval);
      
      events.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, []);
  
  return { resetTimeout };
}
