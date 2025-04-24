import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Sparkles, MessageSquareText, Eye, Edit, Wand2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ListSkills } from '../ListSkills';
import { extractSkillsFromText, deduceEducationLevelFromText, estimateCompensationAmount } from '@/lib/aiHelpers';
import FormattedText from "@/components/FormattedText";
import { useSessionTimeout } from "@/contexts/SessionTimeoutContext";
import AIStageGenerator from "@/components/AIStageGenerator";

type StageType = 'temps_plein' | 'temps_partiel' | 'alternance' | 'remote';
type StageStatus = 'draft' | 'active' | 'expired';

type Stage = Database['public']['Tables']['stages']['Row'];

interface AddInternshipOfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Stage) => void;
  initialData?: Stage;
}

export default function AddInternshipOfferForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddInternshipOfferFormProps) {
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewTab, setPreviewTab] = useState<"data" | "post">("data");
  const { resetTimer } = useSessionTimeout();
  
  // États pour les générateurs IA
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [currentAIContentType, setCurrentAIContentType] = useState<'description' | 'responsibilities' | 'requirements'>('description');

  const [startDate] = useState<Date>(new Date());
  const [requiredSkills, setRequiredSkills] = useState<[string, ...string[]]>([""]);
  const [preferredSkills, setPreferredSkills] = useState<[string, ...string[]]>([""]);
  const [educationLevel, setEducationLevel] = useState("");
  const [compensationAmount, setCompensationAmount] = useState(0);
  const [compensationCurrency, setCompensationCurrency] = useState("XAF");
  const [type, setType] = useState<StageType>("temps_plein");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<StageStatus>("active");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);

  // Réinitialiser le timer d'inactivité lors du montage du composant
  useEffect(() => {
    resetTimer();
    // Réinitialiser le timer d'inactivité lors des interactions utilisateur
    const handleUserActivity = () => resetTimer();
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    
    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [resetTimer]);

  // Fonction pour ouvrir le générateur IA avec le type de contenu spécifié
  const openAIGenerator = (contentType: 'description' | 'responsibilities' | 'requirements') => {
    resetTimer();
    setCurrentAIContentType(contentType);
    setShowAIGenerator(true);
  };

  // Fonction pour gérer le contenu généré par l'IA
  const handleGeneratedContent = (content: string, type: 'description' | 'responsibilities' | 'requirements') => {
    resetTimer();
    if (type === 'description') {
      setDescription(content);
    }
    // Fermer le générateur IA
    setShowAIGenerator(false);
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    resetTimer();
    setLoading(true);
    try {
      // Générer des suggestions pour les compétences et autres champs, mais pas les dates
      const skills = await extractSkillsFromText(description);
      const educationLevel = await deduceEducationLevelFromText(description);
      const compensationAmount = await estimateCompensationAmount(type, location);

      setRequiredSkills(skills as [string, ...string[]]);
      setPreferredSkills(skills as [string, ...string[]]);
      setEducationLevel(educationLevel);
      setCompensationAmount(compensationAmount);
      
      // Ne pas passer en mode prévisualisation automatiquement
      // Afficher un message de succès à la place
      toast.success("Suggestions générées avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      toast.error("Impossible de générer les suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetTimer();
    setLoading(true);

    // Validation des champs obligatoires
    if (!description.trim()) {
      toast.error("La description du stage est obligatoire");
      setLoading(false);
      return;
    }

    if (!location.trim()) {
      toast.error("Le lieu du stage est obligatoire");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour créer une offre de stage");
        setLoading(false);
        return;
      }

      // Extraction du titre à partir de la première ligne de la description
      const titleFromDescription = description.split('\n')[0].trim();
      // Limiter le titre à 255 caractères maximum
      const limitedTitle = (titleFromDescription || 'Offre de stage sans titre').slice(0, 250);
      
      // Limiter la description courte à 255 caractères
      const shortDescription = description.slice(0, 250);
      
      // Limiter la longueur de l'emplacement
      const limitedLocation = location.slice(0, 250);
      
      // Limiter la politique de travail à distance
      const remotePolicy = (type === 'remote' ? 'Télétravail' : 'Présentiel').slice(0, 250);
      
      // Limiter le niveau d'éducation
      const limitedEducationLevel = (educationLevel || 'Non spécifié').slice(0, 250);

      // Préparer les compétences pour s'assurer qu'elles sont au bon format
      // et limiter chaque compétence à 250 caractères
      const cleanRequiredSkills = requiredSkills
        .filter(skill => skill.trim() !== '')
        .map(skill => skill.trim().slice(0, 250));
        
      const cleanPreferredSkills = preferredSkills
        .filter(skill => skill.trim() !== '')
        .map(skill => skill.trim().slice(0, 250));

      // Préparer l'objet compensation en tant que chaîne JSON
      const compensationObject = {
        amount: compensationAmount || 0,
        currency: compensationCurrency || 'XAF',
        period: 'mois'
      };
      
      // S'assurer que la chaîne JSON ne dépasse pas 255 caractères
      const compensationJson = JSON.stringify(compensationObject);
      const limitedCompensationJson = compensationJson.length > 250 
        ? JSON.stringify({ amount: compensationAmount || 0, currency: 'XAF' })
        : compensationJson;
      
      // Convertir les dates au format ISO
      const formattedStartDate = startDate ? startDate.toISOString() : null;
      const formattedDeadline = deadline ? deadline.toISOString() : null;

      const stageData = {
        entreprise_id: user.id,
        title: limitedTitle,
        description, // La description complète peut être longue, mais vérifiez que la colonne est de type TEXT
        short_description: shortDescription,
        requirements: description, // Vérifiez que cette colonne est de type TEXT
        responsibilities: description, // Vérifiez que cette colonne est de type TEXT
        location: limitedLocation,
        remote_policy: remotePolicy,
        type,
        start_date: formattedStartDate,
        // Stocker la compensation comme une chaîne JSON
        compensation: limitedCompensationJson,
        required_skills: cleanRequiredSkills,
        preferred_skills: cleanPreferredSkills,
        education_level: limitedEducationLevel,
        status: 'active',
        deadline: formattedDeadline,
        is_featured: isFeatured,
        is_urgent: isUrgent,
        views_count: 0,
        applications_count: 0
      };

      console.log("Données à insérer:", stageData);

      const { data, error } = await supabase
        .from('stages')
        .insert(stageData)
        .select();

      if (error) {
        console.error("Erreur lors de l'insertion de l'offre de stage:", error);
        // Afficher plus de détails sur l'erreur
        if (error.details) console.error("Détails de l'erreur:", error.details);
        if (error.hint) console.error("Indice:", error.hint);
        if (error.message) console.error("Message:", error.message);
        
        toast.error(`Impossible de créer l'offre de stage: ${error.message || 'Erreur inconnue'}`);
        return;
      }

      toast.success("Offre de stage créée avec succès");
      onSave(data[0]);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      // Afficher plus de détails sur l'erreur
      if (error instanceof Error) {
        console.error("Message d'erreur:", error.message);
        toast.error(`Une erreur est survenue: ${error.message}`);
      } else {
        toast.error("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showPreview) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
        <div className="relative w-full max-w-2xl mx-auto mt-10">
          <Card className="rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Prévisualisation de l'offre de stage</CardTitle>
              <CardDescription>
                Vérifiez et ajustez les champs remplis automatiquement par l'IA.
              </CardDescription>
              <div className="mt-4">
                <Tabs value={previewTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="data" 
                      onClick={() => {
                        resetTimer();
                        setPreviewTab("data");
                      }}
                    >
                      Données extraites
                    </TabsTrigger>
                    <TabsTrigger 
                      value="post" 
                      onClick={() => {
                        resetTimer();
                        setPreviewTab("post");
                      }}
                    >
                      Aperçu du post
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <TabsContent value="data" className="mt-0">
              <div>
                <Label>Compétences requises</Label>
                <Input
                  type="text"
                  value={requiredSkills.join(', ')}
                  onChange={(e) => setRequiredSkills(e.target.value.split(', ') as [string, ...string[]])}
                />
              </div>
              <div>
                <Label>Compétences préférées</Label>
                <Input
                  type="text"
                  value={preferredSkills.join(', ')}
                  onChange={(e) => setPreferredSkills(e.target.value.split(', ') as [string, ...string[]])}
                />
              </div>
              <div>
                <Label>Niveau d'éducation</Label>
                <Input
                  type="text"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                />
              </div>
              <div>
                <Label>Montant de la compensation</Label>
                <Input
                  type="number"
                  value={compensationAmount}
                  onChange={(e) => setCompensationAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Lieu</Label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <Label>Type de stage</Label>
                <Select 
                  value={type} 
                  onValueChange={(value: StageType) => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="remote">Télétravail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date de début</Label>
                <Calendar
                  value={startDate}
                  onChange={(date) => startDate}
                />
              </div>
              <div>
                <Label>Date limite</Label>
                <Calendar
                  value={deadline}
                  onChange={(date) => setDeadline(date)}
                />
              </div>
              </TabsContent>
              
              <TabsContent value="post" className="mt-0">
                <div className="rounded-lg border overflow-hidden bg-white">
                  {/* En-tête du post */}
                  <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {description.split('\n')[0].trim() || "Offre de stage"}
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                          <line x1="16" x2="16" y1="2" y2="6"/>
                          <line x1="8" x2="8" y1="2" y2="6"/>
                          <line x1="3" x2="21" y1="10" y2="10"/>
                        </svg>
                        {startDate ? format(startDate, 'dd MMM yyyy') : 'Date à définir'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {type === 'temps_plein' ? 'Temps plein' : 
                         type === 'temps_partiel' ? 'Temps partiel' : 
                         type === 'alternance' ? 'Alternance' : 'Télétravail'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/>
                          <line x1="2" y1="20" x2="2" y2="20"/>
                        </svg>
                        {compensationAmount} {compensationCurrency}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.filter(s => s.trim()).map((skill, index) => (
                        <span key={index} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Corps du post */}
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <div className="prose prose-sm max-w-none">
                        <FormattedText text={description} highlightKeywords={true} />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Profil recherché</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Niveau d'études : {educationLevel}</li>
                        {requiredSkills.filter(s => s.trim()).map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Informations complémentaires</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type de contrat</p>
                          <p>{type === 'temps_plein' ? 'Stage à temps plein' : 
                              type === 'temps_partiel' ? 'Stage à temps partiel' : 
                              type === 'alternance' ? 'Alternance' : 'Télétravail'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Lieu</p>
                          <p>{location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date de début</p>
                          <p>{startDate ? format(startDate, 'dd MMMM yyyy') : 'Date à définir'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rémunération</p>
                          <p>{compensationAmount} {compensationCurrency}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <button className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                        Postuler à cette offre
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetTimer();
                    onClose();
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? "En cours..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
      <div className="relative w-full max-w-2xl mx-auto mt-10">
        {/* Générateur IA */}
        <AIStageGenerator 
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onGenerated={handleGeneratedContent}
          contentType={currentAIContentType}
          initialPrompt={description}
        />
        
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Ajouter une offre de stage
            </CardTitle>
            <CardDescription>
              Décrivez votre stage en détail. L'IA remplira automatiquement les autres champs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePreview} className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="description">Description complète du stage</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs flex items-center gap-1"
                      onClick={() => {
                        resetTimer();
                        openAIGenerator('description');
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Améliorer avec IA
                    </Button>
                    {description.length > 100 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex items-center gap-1"
                        onClick={() => {
                          resetTimer();
                          setActiveTab(activeTab === "edit" ? "preview" : "edit");
                        }}
                      >
                        {activeTab === "edit" ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Aperçu formaté
                          </>
                        ) : (
                          <>
                            <Edit className="h-3.5 w-3.5" />
                            Éditer
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {activeTab === "edit" ? (
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      resetTimer();
                      setDescription(e.target.value);
                    }}
                    className="min-h-[200px]"
                    placeholder="Décrivez le poste, les responsabilités, les compétences requises, etc. Plus votre description est détaillée, meilleures seront les suggestions de l'IA."
                    required
                  />
                ) : (
                  <div className="border rounded-md p-4 min-h-[200px] bg-white overflow-y-auto">
                    <FormattedText text={description} highlightKeywords={true} />
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Conseil : Incluez des détails sur les technologies, les responsabilités et le profil recherché.
                </p>
              </div>
              
              <div>
                <Label htmlFor="location">Lieu du stage</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => {
                    resetTimer();
                    setLocation(e.target.value);
                  }}
                  placeholder="Ex: Paris, Lyon, Remote..."
                  required
                />
              </div>
              
              <div>
                <Label>Type de stage</Label>
                <Select 
                  value={type} 
                  onValueChange={(value: StageType) => {
                    resetTimer();
                    setType(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                    <SelectItem value="alternance">Alternance</SelectItem>
                    <SelectItem value="remote">Télétravail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetTimer();
                  onClose();
                }}
              >
                Annuler
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePreview} 
                variant="outline"
                disabled={loading || !description.trim() || !location.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Générer les suggestions
                  </>
                )}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !description.trim() || !location.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>En cours...</>
                ) : (
                  <>Publier l'offre</>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
