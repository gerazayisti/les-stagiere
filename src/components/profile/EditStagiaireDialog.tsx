import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
import { X } from "lucide-react";

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

export function EditStagiaireDialog({ 
  stagiaireId, 
  initialData,
  onSuccess,
  isOpen: externalOpen,
  onClose
}: EditStagiaireDialogProps) {
  const [open, setOpen] = useState(externalOpen || false);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [preferredDomains, setPreferredDomains] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [domainInput, setDomainInput] = useState("");

  // Update open state when external state changes
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handle dialog close
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

  // Fetch stagiaire data including arrays
  useEffect(() => {
    async function fetchStagiaireData() {
      if (!stagiaireId) return;
      
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
  }, [stagiaireId]);

  const onSubmit = async (values: StagiaireFormValues) => {
    setIsLoading(true);
    try {
      // Prepare social media object
      const social_links = {
        website: values.website || "",
        github: values.github || "",
        linkedin: values.linkedin || "",
      };

      // Prepare update data
      const updateData = {
        ...values,
        skills,
        languages,
        preferred_locations: preferredLocations,
        preferred_domains: preferredDomains,
        social_links,
      };

      // Remove individual social fields from the update data
      delete updateData.website;
      delete updateData.github;
      delete updateData.linkedin;

      const { error } = await supabase
        .from("stagiaires")
        .update(updateData)
        .eq("id", stagiaireId);

      if (error) throw error;
      
      toast.success("Profil mis à jour avec succès");
      handleOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skills
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Handle languages
  const addLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
  };

  // Handle preferred locations
  const addLocation = () => {
    if (locationInput.trim() && !preferredLocations.includes(locationInput.trim())) {
      setPreferredLocations([...preferredLocations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setPreferredLocations(preferredLocations.filter(l => l !== location));
  };

  // Handle preferred domains
  const addDomain = () => {
    if (domainInput.trim() && !preferredDomains.includes(domainInput.trim())) {
      setPreferredDomains([...preferredDomains, domainInput.trim()]);
      setDomainInput("");
    }
  };

  const removeDomain = (domain: string) => {
    setPreferredDomains(preferredDomains.filter(d => d !== domain));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} placeholder="Ex: Développeur Web Junior" />
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Parlez de vous et de vos compétences..."
                        className="resize-none"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Paris, France" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formation</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Décrivez votre parcours académique..."
                        className="resize-none"
                        rows={3}
                      />
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
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+33 6 12 34 56 78" />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre disponibilité" />
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

              <FormField
                control={form.control}
                name="experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Années d'expérience</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" max="50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="search_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut de recherche</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Recherche active</SelectItem>
                        <SelectItem value="passive">Recherche passive</SelectItem>
                        <SelectItem value="not_searching">Pas en recherche</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Compétences */}
              <div className="space-y-2">
                <FormLabel>Compétences</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Ajouter une compétence"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Langues */}
              <div className="space-y-2">
                <FormLabel>Langues</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Ajouter une langue"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLanguage();
                      }
                    }}
                  />
                  <Button type="button" onClick={addLanguage}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {languages.map((language) => (
                    <Badge key={language} variant="secondary" className="flex items-center gap-1">
                      {language}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeLanguage(language)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Lieux préférés */}
              <div className="space-y-2">
                <FormLabel>Lieux préférés</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Ajouter un lieu"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLocation();
                      }
                    }}
                  />
                  <Button type="button" onClick={addLocation}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferredLocations.map((location) => (
                    <Badge key={location} variant="secondary" className="flex items-center gap-1">
                      {location}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeLocation(location)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Domaines préférés */}
              <div className="space-y-2">
                <FormLabel>Domaines préférés</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="Ajouter un domaine"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDomain();
                      }
                    }}
                  />
                  <Button type="button" onClick={addDomain}>Ajouter</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferredDomains.map((domain) => (
                    <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                      {domain}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeDomain(domain)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://monsite.com" />
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
                    <FormLabel>GitHub</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://github.com/username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://monportfolio.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
