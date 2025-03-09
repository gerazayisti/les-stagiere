
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { InternshipOffer } from "@/types/project";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const internshipFormSchema = z.object({
  title: z.string().min(5, {
    message: "Le titre doit contenir au moins 5 caractères.",
  }),
  description: z.string().min(20, {
    message: "La description doit contenir au moins 20 caractères.",
  }),
  location: z.string().min(2, {
    message: "Veuillez spécifier une localisation valide.",
  }),
  type: z.enum(["temps_plein", "temps_partiel", "alternance", "remote"], {
    required_error: "Veuillez sélectionner un type de stage.",
  }),
  duration: z.string().min(2, {
    message: "Veuillez spécifier une durée.",
  }),
  start_date: z.date({
    required_error: "Veuillez sélectionner une date de début.",
  }),
  compensation: z.string().optional(),
  required_skills: z.array(z.string()).nonempty({
    message: "Veuillez ajouter au moins une compétence requise.",
  }),
  preferred_skills: z.array(z.string()).optional(),
  status: z.enum(["active", "closed", "draft"], {
    required_error: "Veuillez sélectionner un statut.",
  }),
});

type InternshipFormValues = z.infer<typeof internshipFormSchema>;

export function AddInternshipOfferForm({ companyId, onSuccess }: { 
  companyId: string, 
  onSuccess?: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newPreferredSkill, setNewPreferredSkill] = useState("");
  
  const defaultValues: Partial<InternshipFormValues> = {
    title: "",
    description: "",
    location: "",
    type: "temps_plein",
    duration: "",
    compensation: "",
    required_skills: [],
    preferred_skills: [],
    status: "draft",
  };

  const form = useForm<InternshipFormValues>({
    resolver: zodResolver(internshipFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: InternshipFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert date to ISO string for storage
      const formattedData = {
        ...data,
        start_date: data.start_date.toISOString(),
        entreprise_id: companyId,
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('stages')
        .insert([formattedData]);
      
      if (error) {
        console.error("Erreur lors de l'enregistrement:", error);
        toast.error("Impossible d'enregistrer l'offre de stage");
        return;
      }
      
      toast.success("Offre de stage ajoutée avec succès");
      form.reset(defaultValues);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRequiredSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues().required_skills || [];
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue("required_skills", [...currentSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeRequiredSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues().required_skills || [];
    form.setValue(
      "required_skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const addPreferredSkill = () => {
    if (!newPreferredSkill.trim()) return;
    
    const currentSkills = form.getValues().preferred_skills || [];
    if (!currentSkills.includes(newPreferredSkill.trim())) {
      form.setValue("preferred_skills", [...currentSkills, newPreferredSkill.trim()]);
      setNewPreferredSkill("");
    }
  };

  const removePreferredSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues().preferred_skills || [];
    form.setValue(
      "preferred_skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de l'offre*</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Stage développeur web fullstack" {...field} />
              </FormControl>
              <FormDescription>
                Un titre précis et attractif pour votre offre de stage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez les missions, responsabilités et objectifs du stage..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Une description détaillée du stage, des responsabilités et du contexte.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localisation*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Paris, France" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de stage*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="remote">Télétravail</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 6 mois" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="compensation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rémunération</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 800€/mois" {...field} />
              </FormControl>
              <FormDescription>
                Indiquez la rémunération proposée pour ce stage (optionnel).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required_skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compétences requises*</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Ex: React.js"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRequiredSkill();
                      }
                    }}
                  />
                </FormControl>
                <Button type="button" size="sm" onClick={addRequiredSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value?.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <FormDescription>
                Compétences essentielles que le candidat doit posséder.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferred_skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compétences souhaitées</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Ex: TypeScript"
                    value={newPreferredSkill}
                    onChange={(e) => setNewPreferredSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPreferredSkill();
                      }
                    }}
                  />
                </FormControl>
                <Button type="button" size="sm" onClick={addPreferredSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value?.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(skill)}
                      className="ml-1 text-muted-foreground/70 hover:text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <FormDescription>
                Compétences qui seraient un plus pour la candidature (optionnel).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut de l'offre*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Fermée</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                "Brouillon" n'est pas visible par les candidats, "Active" est publiée, "Fermée" n'accepte plus de candidatures.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Ajouter l'offre de stage"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
