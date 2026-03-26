import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  User2, 
  GraduationCap, 
  Settings, 
  Link as LinkIcon, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  MapPin,
  Phone,
  Globe,
  Github,
  Linkedin,
  Languages,
  Wrench,
  Briefcase
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TagSelector } from "@/components/ui/tag-selector";
import { 
  SKILLS_OPTIONS, 
  LANGUAGES_OPTIONS, 
  DOMAINS_OPTIONS, 
  LOCATIONS_OPTIONS 
} from "../registration/registrationOptions";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  education: z.string().optional(),
  phone: z.string().optional(),
  disponibility: z.enum(["upcoming", "immediate"]).optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  github: z.string().url("URL invalide").optional().or(z.literal("")),
  linkedin: z.string().url("URL invalide").optional().or(z.literal("")),
  portfolio_url: z.string().url("URL invalide").optional().or(z.literal("")),
  experience_years: z.coerce.number().min(0).max(50).optional(),
  search_status: z.string().optional(),
});

export type StagiaireFormValues = z.infer<typeof formSchema>;

interface EditStagiaireDialogProps {
  stagiaireId: string;
  initialData: StagiaireFormValues;
  onSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold">
      <Icon className="h-4 w-4 text-primary" />
      {text}
    </span>
  );
}

export function EditStagiaireDialog({ 
  stagiaireId, 
  initialData,
  onSuccess,
  isOpen: externalOpen,
  onClose
}: EditStagiaireDialogProps) {
  const [open, setOpen] = useState(externalOpen || false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [preferredDomains, setPreferredDomains] = useState<string[]>([]);

  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
      if (externalOpen) setStep(1);
    }
  }, [externalOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const form = useForm<StagiaireFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    async function fetchStagiaireData() {
      if (!stagiaireId || !open) return;
      
      try {
        const { data, error } = await supabase
          .from("stagiaires")
          .select("skills, languages, preferred_locations, preferred_domains")
          .eq("id", stagiaireId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setSkills(data.skills || []);
          setLanguages(data.languages || []);
          setPreferredLocations(data.preferred_locations || []);
          setPreferredDomains(data.preferred_domains || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    }
    
    fetchStagiaireData();
  }, [stagiaireId, open]);

  const onSubmit = async (values: StagiaireFormValues) => {
    setIsLoading(true);
    try {
      const social_links = {
        website: values.website || "",
        github: values.github || "",
        linkedin: values.linkedin || "",
      };

      const updateData = {
        ...values,
        skills,
        languages,
        preferred_locations: preferredLocations,
        preferred_domains: preferredDomains,
        social_links,
        updated_at: new Date().toISOString(),
      };

      // @ts-ignore - Clean up redundant fields
      delete updateData.website;
      // @ts-ignore
      delete updateData.github;
      // @ts-ignore
      delete updateData.linkedin;

      const { error } = await supabase
        .from("stagiaires")
        .update(updateData)
        .eq("id", stagiaireId);

      if (error) throw error;
      
      toast.success("Profil mis à jour avec succès");
      handleOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erreur mise à jour profil:", error);
      toast.error(`Erreur : ${error.message || "Impossible de mettre à jour le profil"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold border-primary/30 text-primary">
              Profil Stagiaire • Étape {step}/{totalSteps}
            </Badge>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {step === 1 && <><User2 className="h-6 w-6 text-primary" /> Identité & Bio</>}
            {step === 2 && <><GraduationCap className="h-6 w-6 text-primary" /> Formation & Expérience</>}
            {step === 3 && <><Settings className="h-6 w-6 text-primary" /> Compétences & Préférences</>}
            {step === 4 && <><LinkIcon className="h-6 w-6 text-primary" /> Liens & Contact</>}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Mettez à jour vos informations de base et votre présentation."}
            {step === 2 && "Partagez votre parcours académique et votre disponibilité."}
            {step === 3 && "Optimisez votre visibilité en précisant vos technos et lieux favoris."}
            {step === 4 && "Où les recruteurs peuvent-ils vous trouver en dehors de LesStagiaires ?"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <ScrollArea className="max-h-[60vh] px-6 py-4">
              <div className="space-y-6 pb-4">
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre professionnel</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Développeur Fullstack React" className="h-11 shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Votre bio</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Décrivez vos aspirations et ce que vous apportez..."
                              className="min-h-[120px] shadow-sm resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* STEP 2: EDUCATION */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parcours académique</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Détaillez vos diplômes et certifications..."
                              className="min-h-[100px] shadow-sm resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="experience_years"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expérience (années)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disponibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disponibilité</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 shadow-sm">
                                  <SelectValue placeholder="Sélectionnez..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immédiate</SelectItem>
                                <SelectItem value="upcoming">Prochainement</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: SKILLS & PREFS */}
                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    <TagSelector
                      label={<SectionLabel icon={Wrench} text="Compétences" />}
                      placeholder="React, Java, UI Design..."
                      options={SKILLS_OPTIONS}
                      selected={skills}
                      onChange={setSkills}
                      colorScheme="primary"
                    />

                    <TagSelector
                      label={<SectionLabel icon={Languages} text="Langues" />}
                      placeholder="Français, Anglais..."
                      options={LANGUAGES_OPTIONS}
                      selected={languages}
                      onChange={setLanguages}
                      colorScheme="primary"
                    />

                    <TagSelector
                      label={<SectionLabel icon={MapPin} text="Lieux de prédilection" />}
                      placeholder="Douala, Yaoundé, Remote..."
                      options={LOCATIONS_OPTIONS}
                      selected={preferredLocations}
                      onChange={setPreferredLocations}
                      colorScheme="primary"
                    />

                    <TagSelector
                      label={<SectionLabel icon={Briefcase} text="Secteurs d'intérêt" />}
                      placeholder="Finlande, Santé, IA..."
                      options={DOMAINS_OPTIONS}
                      selected={preferredDomains}
                      onChange={setPreferredDomains}
                      colorScheme="primary"
                    />
                  </div>
                )}

                {/* STEP 4: CONTACT & LINKS */}
                {step === 4 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Habite à</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ville, Pays" className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" /> Téléphone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4 mt-2">
                       <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-[#0A66C2]"><Linkedin className="h-4 w-4" /> LinkedIn</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://linkedin.com/in/..." className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="github"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-gray-900 dark:text-gray-100"><Github className="h-4 w-4" /> GitHub</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://github.com/..." className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4" /> Portfolio / Site Perso</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://mon-site.com" className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 border-t bg-muted/10 flex flex-row sm:justify-between items-center">
              <div>
                {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Annuler
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {step < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="px-8 transition-all hover:gap-1.5 active:scale-95">
                    Suivant <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="px-8 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Enregistrer
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
