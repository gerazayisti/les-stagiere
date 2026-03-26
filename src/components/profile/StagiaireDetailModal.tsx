import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/lib/supabase';
import { MapPin, Briefcase, GraduationCap, Calendar, Mail, Phone, Globe, Github, Linkedin, MessageSquare, Star } from "lucide-react";
import { toast } from 'sonner';

interface StagiaireDetail {
  id: string;
  name: string;
  title?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  phone?: string;
  education?: string;
  disponibility?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string[];
  languages?: string[];
  is_premium?: boolean;
}

interface StagiaireDetailModalProps {
  stagiaireId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onContact?: (stagiaireId: string) => void;
}

export function StagiaireDetailModal({ stagiaireId, isOpen, onClose, onContact }: StagiaireDetailModalProps) {
  const [stagiaire, setStagiaire] = useState<StagiaireDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stagiaireId) {
      fetchStagiaireDetails();
    }
  }, [isOpen, stagiaireId]);

  const fetchStagiaireDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stagiaires')
        .select('*')
        .eq('id', stagiaireId)
        .single();

      if (error) throw error;
      setStagiaire(data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      toast.error('Impossible de charger le profil complet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-2xl shadow-2xl">
        {loading ? (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : stagiaire ? (
          <div className="flex flex-col">
            {/* Header Overlay */}
            <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
              {stagiaire.is_premium && (
                <div className="absolute top-4 right-12">
                   <Badge className="bg-amber-400 hover:bg-amber-500 text-white border-0 shadow-lg px-3 py-1 flex items-center gap-1 scale-110">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    PREMIUM
                  </Badge>
                </div>
              )}
            </div>

            {/* Profile Info Section */}
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={stagiaire.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(stagiaire.name)}&background=random`}
                    alt={stagiaire.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="pt-16 md:pt-20 flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 leading-tight">{stagiaire.name}</h2>
                  <p className="text-lg text-primary font-medium mt-1">{stagiaire.title || "Étudiant en recherche de stage"}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary" />
                      {stagiaire.location || "Cameroun"}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary" />
                      {stagiaire.disponibility || "Disponible immédiatement"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {/* Left Column: Bio & Skills */}
                <div className="md:col-span-2 space-y-8">
                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">À propos de moi</h3>
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                        {stagiaire.bio || "Ce candidat n'a pas encore rédigé de biographie."}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Compétences clés</h3>
                    <div className="flex flex-wrap gap-2">
                      {stagiaire.skills?.map((skill, index) => (
                        <Badge key={index} className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-xl text-sm hover:bg-primary/10 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Parcours académique</h3>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                       <div className="p-3 bg-secondary/10 rounded-xl">
                        <GraduationCap className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Formation</h4>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{stagiaire.education || "Non renseigné"}</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Contact & Links */}
                <div className="space-y-6">
                  <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
                    
                    <h3 className="text-lg font-bold flex items-center gap-2">
                       Prendre contact
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                      <Button 
                        onClick={() => onContact?.(stagiaire.id)}
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Envoyer un message
                      </Button>
                      
                      <div className="pt-4 space-y-3 border-t border-white/10">
                        {stagiaire.phone && (
                          <a href={`tel:${stagiaire.phone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors py-2 group/link">
                             <div className="p-2 bg-white/5 rounded-lg group-hover/link:bg-primary/20">
                              <Phone className="w-4 h-4" />
                             </div>
                             {stagiaire.phone}
                          </a>
                        )}
                        <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors py-2 group/link">
                           <div className="p-2 bg-white/5 rounded-lg group-hover/link:bg-primary/20">
                            <Mail className="w-4 h-4" />
                           </div>
                           Email via plateforme
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex justify-center gap-4 border-t border-white/10">
                      {stagiaire.linkedin_url && (
                        <a href={stagiaire.linkedin_url} target="_blank" className="p-2 bg-white/5 rounded-xl hover:bg-primary/20 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {stagiaire.github_url && (
                        <a href={stagiaire.github_url} target="_blank" className="p-2 bg-white/5 rounded-xl hover:bg-primary/20 transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {stagiaire.portfolio_url && (
                        <a href={stagiaire.portfolio_url} target="_blank" className="p-2 bg-white/5 rounded-xl hover:bg-primary/20 transition-colors">
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-secondary/5 border border-secondary/10 p-6 rounded-3xl">
                    <h4 className="font-bold text-gray-900 text-sm mb-3">Langues</h4>
                    <div className="flex flex-wrap gap-2">
                      {stagiaire.languages?.map((lang, i) => (
                        <Badge key={i} variant="outline" className="border-secondary/20 text-secondary bg-white">
                          {lang}
                        </Badge>
                      ))}
                      {(!stagiaire.languages || stagiaire.languages.length === 0) && (
                        <span className="text-xs text-muted-foreground">Français (natif)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            Aucun profil trouvé pour cet identifiant.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
