
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InternshipOffer } from '@/types/project';
import { toast } from 'sonner';
import { realtimeManager } from '@/lib/realtime';

export function useInternshipOffers(companyId: string) {
  const [offers, setOffers] = useState<InternshipOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        
        // Try to get from cache first for immediate UI response
        const cachedOffers = localStorage.getItem(`cachedOffers_${companyId}`);
        if (cachedOffers) {
          const { data, timestamp } = JSON.parse(cachedOffers);
          // Use cache if less than 2 minutes old
          if (Date.now() - timestamp < 120000) {
            setOffers(data);
            setLoading(false);
            // Still fetch fresh data in the background
          }
        }

        const { data, error } = await supabase
          .from('stages')
          .select('*')
          .eq('entreprise_id', companyId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const offersData = data as unknown as InternshipOffer[];
        
        // Cache the offers
        localStorage.setItem(`cachedOffers_${companyId}`, JSON.stringify({
          data: offersData,
          timestamp: Date.now()
        }));
        
        setOffers(offersData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching offers:", err);
        setError(err.message);
        setLoading(false);
        toast.error("Impossible de charger les offres de stage");
      }
    };

    fetchOffers();
    
    // Subscribe to real-time updates
    const unsubscribe = realtimeManager.subscribeToStages((payload) => {
      const { eventType, new: newOffer, old: oldOffer } = payload;
      
      if (newOffer.entreprise_id === companyId) {
        if (eventType === 'INSERT') {
          setOffers(prev => [newOffer as unknown as InternshipOffer, ...prev]);
          toast.success("Nouvelle offre de stage ajoutée");
        } else if (eventType === 'UPDATE') {
          setOffers(prev => 
            prev.map(offer => 
              offer.id === newOffer.id 
                ? { ...offer, ...newOffer } as unknown as InternshipOffer
                : offer
            )
          );
        } else if (eventType === 'DELETE') {
          setOffers(prev => prev.filter(offer => offer.id !== oldOffer.id));
          toast.info("Une offre de stage a été supprimée");
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [companyId]);

  return { offers, loading, error };
}
