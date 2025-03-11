
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Form validation schema
const enterpriseFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  description: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "Veuillez entrer une URL valide" }).optional().or(z.literal('')),
  phone: z.string().optional(),
  size: z.string().optional(),
  founded_year: z.coerce.number().min(1800).max(new Date().getFullYear()).optional().or(z.literal(0)),
  linkedin: z.string().url({ message: "Veuillez entrer une URL LinkedIn valide" }).optional().or(z.literal('')),
  github: z.string().url({ message: "Veuillez entrer une URL GitHub valide" }).optional().or(z.literal('')),
  logo_url: z.string().optional(),
  banner_url: z.string().optional(),
  company_culture: z.string().optional(),
  benefits: z.array(z.string()).optional(),
});

type EnterpriseFormValues = z.infer<typeof enterpriseFormSchema>;

// Company sizes for dropdown
const companySizes = [
  { value: "1-10", label: "1-10 employés" },
  { value: "11-50", label: "11-50 employés" },
  { value: "51-200", label: "51-200 employés" },
  { value: "201-500", label: "201-500 employés" },
  { value: "501-1000", label: "501-1000 employés" },
  { value: "1000+", label: "Plus de 1000 employés" },
];

// Industry sectors for dropdown
const industrySectors = [
  { value: "tech", label: "Technologie" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Santé" },
  { value: "education", label: "Éducation" },
  { value: "retail", label: "Commerce de détail" },
  { value: "manufacturing", label: "Industrie" },
  { value: "services", label: "Services" },
  { value: "media", label: "Médias et Communication" },
  { value: "nonprofit", label: "Associations et ONG" },
  { value: "government", label: "Secteur public" },
  { value: "other", label: "Autre" },
];

interface EditEntrepriseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entrepriseId: string;
  onUpdate: () => void;
}

export function EditEntrepriseDialog({ 
  isOpen, 
  onClose, 
  entrepriseId,
  onUpdate 
}: EditEntrepriseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [benefitsInput, setBenefitsInput] = useState("");
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  
  // Define the form with validation
  const form = useForm<EnterpriseFormValues>({
    resolver: zodResolver(enterpriseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      location: "",
      website: "",
      phone: "",
      size: "",
      founded_year: 0,
      linkedin: "",
      github: "",
      company_culture: "",
      benefits: [],
    },
  });

  // Fetch enterprise data
  useEffect(() => {
    async function fetchEntrepriseData() {
      if (!entrepriseId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('entreprises')
          .select('*')
          .eq('id', entrepriseId)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Set form values from data
          form.reset({
            name: data.name || "",
            description: data.description || "",
            industry: data.industry || "",
            location: data.location || "",
            website: data.website || "",
            phone: data.phone || "",
            size: data.size || "",
            founded_year: data.founded_year || 0,
            linkedin: data.social_media?.linkedin || "",
            github: data.social_media?.github || "",
            logo_url: data.logo_url || "",
            banner_url: data.banner_url || "",
            company_culture: data.company_culture || "",
            benefits: data.benefits || [],
          });
          
          // Set benefits list for UI
          setBenefitsList(data.benefits || []);
        }
      } catch (error) {
        console.error('Error fetching enterprise data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isOpen) {
      fetchEntrepriseData();
    }
  }, [isOpen, entrepriseId, form]);
  
  // Handle form submission
  const onSubmit = async (values: EnterpriseFormValues) => {
    setIsLoading(true);
    
    try {
      // Prepare the social media field
      const social_media = {
        linkedin: values.linkedin || null,
        github: values.github || null,
      };
      
      // Update the enterprise record
      const { error } = await supabase
        .from('entreprises')
        .update({
          name: values.name,
          description: values.description,
          industry: values.industry,
          location: values.location,
          website: values.website,
          phone: values.phone,
          size: values.size,
          founded_year: values.founded_year || null,
          social_media,
          company_culture: values.company_culture,
          benefits: benefitsList,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entrepriseId);
      
      if (error) {
        throw error;
      }
      
      toast.success('Profil mis à jour avec succès');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating enterprise:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le profil'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a benefit to the list
  const addBenefit = () => {
    if (benefitsInput.trim() && !benefitsList.includes(benefitsInput.trim())) {
      const newBenefits = [...benefitsList, benefitsInput.trim()];
      setBenefitsList(newBenefits);
      form.setValue('benefits', newBenefits);
      setBenefitsInput("");
    }
  };
  
  // Remove a benefit from the list
  const removeBenefit = (benefit: string) => {
    const newBenefits = benefitsList.filter(b => b !== benefit);
    setBenefitsList(newBenefits);
    form.setValue('benefits', newBenefits);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil de l'entreprise</DialogTitle>
        </DialogHeader>
        
        {isLoading && !form.formState.isSubmitting ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informations de base */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise*</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur d'activité</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un secteur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industrySectors.map((sector) => (
                            <SelectItem key={sector.value} value={sector.value}>
                              {sector.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="Paris, France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille de l'entreprise</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nombre d'employés" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="founded_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année de fondation</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="2010" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
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
                        <Input placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description de l'entreprise</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez votre entreprise..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Company culture */}
              <FormField
                control={form.control}
                name="company_culture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Culture d'entreprise</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez la culture de votre entreprise..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Décrivez l'ambiance de travail, les valeurs et la philosophie de votre entreprise.
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              {/* Benefits */}
              <div className="space-y-2">
                <FormLabel>Avantages</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un avantage..."
                    value={benefitsInput}
                    onChange={(e) => setBenefitsInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" onClick={addBenefit} size="sm">
                    Ajouter
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {benefitsList.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {benefitsList.length === 0 && (
                    <p className="text-muted-foreground text-sm">Aucun avantage ajouté</p>
                  )}
                </div>
              </div>
              
              {/* Liens externes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://votre-entreprise.com" {...field} />
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
                        <Input placeholder="https://linkedin.com/company/..." {...field} />
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
                        <Input placeholder="https://github.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
