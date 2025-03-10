
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddRecommendationModal } from "./AddRecommendationModal";
import { Search, Star, User, MessageSquare, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

type Intern = {
  id: string;
  name: string;
  hasRecommendation: boolean;
  skills?: string[];
  location?: string;
  disponibility?: string;
  experience_years?: number;
  avatar_url?: string;
};

export interface CompanyRecommendationsProps {
  userId: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  interns?: Intern[];
  onMessageClick?: (entrepriseId: string) => Promise<void>;
  isPremium?: boolean;
}

export function CompanyRecommendations({
  userId,
  companyId,
  companyName,
  companyLogo,
  interns: initialInterns = [],
  onMessageClick,
  isPremium = false
}: CompanyRecommendationsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [loading, setLoading] = useState(initialInterns.length === 0);
  const [interns, setInterns] = useState<Intern[]>(initialInterns);
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>(initialInterns);
  const [sortOrder, setSortOrder] = useState<"name" | "experience" | "disponibility">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState({
    onlyAvailable: false,
    onlyWithSkills: false,
    minimumExperience: 0
  });

  // Load interns if not provided initially
  useEffect(() => {
    if (initialInterns.length === 0 && companyId) {
      fetchInterns();
    }
  }, [companyId, initialInterns.length]);

  // Filter and sort interns whenever search query, filters, or sort options change
  useEffect(() => {
    let result = [...interns];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(intern => 
        intern.name.toLowerCase().includes(query) || 
        intern.skills?.some(skill => skill.toLowerCase().includes(query)) ||
        intern.location?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.onlyAvailable) {
      result = result.filter(intern => intern.disponibility === "immediate");
    }

    if (filters.onlyWithSkills) {
      result = result.filter(intern => intern.skills && intern.skills.length > 0);
    }

    if (filters.minimumExperience > 0) {
      result = result.filter(intern => 
        (intern.experience_years || 0) >= filters.minimumExperience
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortOrder === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortOrder === "experience") {
        comparison = (a.experience_years || 0) - (b.experience_years || 0);
      } else if (sortOrder === "disponibility") {
        const disponibilityValue = {
          immediate: 0,
          upcoming: 1,
          undefined: 2
        };
        comparison = 
          disponibilityValue[a.disponibility as keyof typeof disponibilityValue || 'undefined'] - 
          disponibilityValue[b.disponibility as keyof typeof disponibilityValue || 'undefined'];
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredInterns(result);
  }, [interns, searchQuery, filters, sortOrder, sortDirection]);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      
      // First try to get from cache
      const cachedData = localStorage.getItem(`cachedRecommendableInterns`);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Use cache if less than 5 minutes old
        if (Date.now() - timestamp < 300000) {
          setInterns(data);
          setLoading(false);
          // Still fetch fresh data in the background
        }
      }
      
      // Get all stagiaires
      const { data: stagiairesData, error: stagiairesError } = await supabase
        .from('stagiaires')
        .select('id, name, skills, location, disponibility, experience_years, avatar_url');
        
      if (stagiairesError) {
        throw stagiairesError;
      }
      
      // Get all recommendations made by this company
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('recommendations')
        .select('stagiaire_id')
        .eq('entreprise_id', companyId);
        
      if (recommendationsError) {
        throw recommendationsError;
      }
      
      // Create a set of all stagiaire IDs that already have recommendations
      const recommendedStagiaireIds = new Set(
        recommendationsData.map(rec => rec.stagiaire_id)
      );
      
      // Format the data with the hasRecommendation flag
      const formattedInterns = stagiairesData.map((stagiaire: any) => ({
        id: stagiaire.id,
        name: stagiaire.name,
        skills: stagiaire.skills || [],
        location: stagiaire.location || "Non spécifié",
        disponibility: stagiaire.disponibility || "upcoming",
        experience_years: stagiaire.experience_years || 0,
        avatar_url: stagiaire.avatar_url,
        hasRecommendation: recommendedStagiaireIds.has(stagiaire.id)
      }));
      
      // Cache the data
      localStorage.setItem(`cachedRecommendableInterns`, JSON.stringify({
        data: formattedInterns,
        timestamp: Date.now()
      }));
      
      setInterns(formattedInterns);
    } catch (error) {
      console.error("Error fetching interns:", error);
      toast.error("Impossible de charger la liste des stagiaires.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (intern: Intern) => {
    setSelectedIntern(intern);
    setShowAddModal(true);
  };

  const handleAddRecommendation = async (data: any) => {
    try {
      // Update the local state to reflect the change
      setInterns(prevInterns => 
        prevInterns.map(intern => 
          intern.id === selectedIntern?.id 
            ? { ...intern, hasRecommendation: true } 
            : intern
        )
      );
      
      toast.success("Recommandation ajoutée avec succès");
      setShowAddModal(false);
      
      // Invalidate the cache to force a fresh fetch next time
      localStorage.removeItem(`cachedRecommendableInterns`);
    } catch (error) {
      console.error("Error adding recommendation:", error);
      toast.error("Erreur lors de l'ajout de la recommandation");
    }
  };

  const handleSortChange = (key: "name" | "experience" | "disponibility") => {
    if (sortOrder === key) {
      // Toggle direction if already sorting by this key
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new sort key and reset direction to asc
      setSortOrder(key);
      setSortDirection("asc");
    }
  };

  const toggleFilter = (key: keyof typeof filters) => {
    if (key === "minimumExperience") {
      setFilters(prev => ({
        ...prev,
        minimumExperience: prev.minimumExperience === 0 ? 1 : 0
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: !prev[key as keyof typeof filters]
      }));
    }
  };

  // Si nous sommes sur le profil d'un stagiaire
  if (!companyId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Aucune entreprise n'a encore recommandé ce profil.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si nous sommes sur le profil d'une entreprise
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommandations aux stagiaires</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Votre avis compte beaucoup pour nos stagiaires. Donnez-leur une
            recommandation pour valoriser leur travail et les aider dans leur
            recherche de stage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, compétence ou lieu..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filtres</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem 
                    checked={filters.onlyAvailable}
                    onCheckedChange={() => toggleFilter("onlyAvailable")}
                  >
                    Disponibilité immédiate
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={filters.onlyWithSkills}
                    onCheckedChange={() => toggleFilter("onlyWithSkills")}
                  >
                    Avec compétences
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={filters.minimumExperience > 0}
                    onCheckedChange={() => toggleFilter("minimumExperience")}
                  >
                    Au moins 1 an d'expérience
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Trier
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem 
                    checked={sortOrder === "name"}
                    onCheckedChange={() => handleSortChange("name")}
                  >
                    Nom {sortOrder === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortOrder === "experience"}
                    onCheckedChange={() => handleSortChange("experience")}
                  >
                    Expérience {sortOrder === "experience" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortOrder === "disponibility"}
                    onCheckedChange={() => handleSortChange("disponibility")}
                  >
                    Disponibilité {sortOrder === "disponibility" && (sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Aucun stagiaire trouvé</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Aucun stagiaire ne correspond à votre recherche ou vous n'avez
                pas encore recruté de stagiaires.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterns.map((intern) => (
                <div
                  key={intern.id}
                  className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      {intern.avatar_url ? (
                        <AvatarImage src={intern.avatar_url} alt={intern.name} />
                      ) : (
                        <AvatarFallback>{intern.name[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{intern.name}</p>
                      <div className="flex flex-wrap mt-1 gap-1">
                        {intern.location && (
                          <Badge variant="outline" className="text-xs">
                            {intern.location}
                          </Badge>
                        )}
                        <Badge 
                          variant={intern.disponibility === "immediate" ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {intern.disponibility === "immediate" 
                            ? "Disponible immédiatement" 
                            : "Disponible prochainement"}
                        </Badge>
                        {intern.experience_years > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {intern.experience_years} an{intern.experience_years > 1 ? 's' : ''} d'expérience
                          </Badge>
                        )}
                      </div>
                      {intern.skills && intern.skills.length > 0 && (
                        <div className="flex flex-wrap mt-2 gap-1 max-w-md">
                          {intern.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {intern.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{intern.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0 self-end sm:self-auto">
                    {isPremium && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMessageClick && onMessageClick(intern.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                    {intern.hasRecommendation ? (
                      <div className="flex items-center gap-1 text-green-600 px-3 py-1">
                        <Star className="h-4 w-4 fill-green-600" />
                        <span>Recommandé</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(intern)}
                      >
                        Recommander
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && selectedIntern && (
        <AddRecommendationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRecommendation}
          initialData={null}
          stagiaire={{ id: selectedIntern.id, name: selectedIntern.name }}
          company={{ id: companyId, name: companyName || "", logo: companyLogo }}
        />
      )}
    </div>
  );
}
