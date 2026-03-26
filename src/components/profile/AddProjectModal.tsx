import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Project, projectSchema, ProjectFormValues } from './types/ProjectTypes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Layers, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Calendar as CalendarIcon, 
  Users, 
  Briefcase,
  Star,
  Github,
  User2
} from "lucide-react";
import { TagSelector } from "@/components/ui/tag-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SKILLS_OPTIONS, DOMAINS_OPTIONS } from '../registration/registrationOptions';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, "id">) => void;
  initialData?: Project | null;
}

export function AddProjectModal({ isOpen, onClose, onSave, initialData }: AddProjectModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      short_description: initialData?.short_description || "",
      domain: initialData?.domain || "",
      technologies: initialData?.technologies || [],
      image_url: initialData?.image_url || "",
      gallery_urls: initialData?.gallery_urls || [],
      project_url: initialData?.project_url || "",
      github_url: initialData?.github_url || "",
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : new Date(),
      status: initialData?.status || "completed",
      highlights: initialData?.highlights || [],
      team_size: initialData?.team_size || 1,
      role: initialData?.role || "",
      is_featured: initialData?.is_featured || false,
      created_at: initialData?.created_at ? new Date(initialData.created_at) : new Date(),
      updated_at: new Date(),
    },
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  function onSubmit(values: ProjectFormValues) {
    onSave(values);
    onClose();
    setStep(1);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setTimeout(() => setStep(1), 300);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden outline-none">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-xs">
              Étape {step} sur {totalSteps}
            </Badge>
            <div className="flex gap-1">
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
            {initialData ? 'Modifier le projet' : 'Ajouter un projet'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Commençons par les informations de base de votre projet."}
            {step === 2 && "Dites-nous en plus sur votre rôle et vos accomplissements."}
            {step === 3 && "Partagez des liens et des visuels de votre réalisation."}
            {step === 4 && "Quelles technologies avez-vous utilisées ?"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <ScrollArea className="max-h-[60vh] px-6 py-4">
              <div className="space-y-6 pb-4">
                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" /> Titre du projet
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: App de Gestion d'Internship" {...field} className="h-11 shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" /> Domaine
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Web Development" {...field} className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <FormControl>
                              <select 
                                {...field}
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="completed">Terminé</option>
                                <option value="in_progress">En cours</option>
                                <option value="planned">Planifié</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>En résumé (accroche)</FormLabel>
                          <FormControl>
                            <Input placeholder="Une phrase qui résume le projet" {...field} className="h-11 shadow-sm" />
                          </FormControl>
                          <FormDescription>Max 500 caractères</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* STEP 2: DETAILS & ROLE */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description détaillée</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez les défis, les solutions et le résultat final..." 
                              className="min-h-[120px] shadow-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User2 className="h-4 w-4 text-primary" /> Votre rôle
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Lead Developer" {...field} className="h-11 shadow-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="team_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" /> Taille de l'équipe
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="h-11 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date de début</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "h-11 pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {field.value ? format(field.value, "PP") : <span>Choisir...</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date de fin</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "h-11 pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {field.value ? format(field.value, "PP") : <span>Choisir...</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: MEDIA & LINKS */}
                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-primary" /> Image principale (URL)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://images.unsplash.com/..." {...field} className="h-11 shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="project_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-primary" /> Demo / Site Web
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://mon-projet.com" {...field} className="h-11 shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="github_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Github className="h-4 w-4 text-primary" /> Lien GitHub
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/votre-user/repo" {...field} className="h-11 shadow-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 bg-muted/30">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-1.5 font-semibold">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Mettre en avant
                            </FormLabel>
                            <FormDescription>
                              Ce projet sera affiché Prioritairement dans votre vitrine.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* STEP 4: TAGS & TECH */}
                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <TagSelector
                        label="🛠 Technologies utilisées"
                        placeholder="Ajoutez vos technos (React, Node, Figma...)"
                        options={SKILLS_OPTIONS}
                        selected={form.watch("technologies") || []}
                        onChange={(vals) => form.setValue("technologies", vals)}
                        colorScheme="primary"
                        allowCustom={true}
                      />
                    </div>

                    <div className="space-y-4">
                      <TagSelector
                        label="🚩 Points forts / Highlights"
                        placeholder="Ex: Performance optimization, Accessibility..."
                        options={["Open Source", "Scalabilité", "Éco-conception", "Innovation"]}
                        selected={form.watch("highlights") || []}
                        onChange={(vals) => form.setValue("highlights", vals)}
                        colorScheme="primary"
                        allowCustom={true}
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
                  <Button type="button" onClick={nextStep} className="px-8 transition-all hover:gap-3">
                    Suivant <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="px-8 bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" /> Enregistrer le projet
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
