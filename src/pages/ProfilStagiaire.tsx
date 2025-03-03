import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutTab } from "@/components/profile/AboutTab";
import { Button } from "@/components/ui/button";
import { Chat, Heart, Edit, Flag, Share2, UserPlus, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CVTab } from "@/components/profile/CVTab";
import { Portfolio } from "@/components/profile/Portfolio";
import { Recommendations } from "@/components/profile/Recommendations";

// Fix the missing 'id' property in ExtendedStagiaireData
interface ExtendedStagiaireData {
  id: string; // Add the missing id property
  name: string;
  email: string;
  bio?: string;
  education?: string;
  avatar_url?: string;
  skills?: string[];
  languages?: string[];
  preferred_locations?: string[];
  disponibility?: "immediate" | "upcoming";
  experience_years?: number;
  website?: string;
  github?: string;
  linkedin?: string;
  cv_url?: string;
  phone?: string;
  is_premium?: boolean;
  last_active?: string;
  created_at?: string;
}

export default function ProfilStagiaire() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stagiaire, setStagiaire] = useState<ExtendedStagiaireData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      toast.error("Stagiaire ID is missing");
      return;
    }

    const fetchStagiaire = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('stagiaires')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching stagiaire:", error);
          toast.error("Failed to load stagiaire profile");
        }

        if (data) {
          setStagiaire(data as ExtendedStagiaireData);
        }
      } catch (error) {
        console.error("Unexpected error fetching stagiaire:", error);
        toast.error("Unexpected error loading stagiaire profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStagiaire();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
      </div>
    );
  }

  if (!stagiaire) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500">
          No stagiaire profile found.
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === stagiaire.id;

  return (
    <div className="container mx-auto p-4">
      <ProfileHeader
        name={stagiaire.name}
        avatarUrl={stagiaire.avatar_url}
        bio={stagiaire.bio}
        location={stagiaire.preferred_locations?.[0] || "N/A"}
        website={stagiaire.website}
        github={stagiaire.github}
        linkedin={stagiaire.linkedin}
      >
        {isOwner ? (
          <>
            <Button variant="outline" size="icon" onClick={() => navigate('/complete-profile')}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Contacter
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Suivre
            </Button>
          </>
        )}
      </ProfileHeader>

      <Tabs defaultValue="a-propos" className="w-full mt-4">
        <TabsList>
          <TabsTrigger value="a-propos">À propos</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>
        <TabsContent value="a-propos">
          <AboutTab
            bio={stagiaire.bio}
            education={stagiaire.education}
            disponibility={stagiaire.disponibility}
            userId={stagiaire.id}
          />
        </TabsContent>
        <TabsContent value="cv">
          <CVTab cvUrl={stagiaire.cv_url} />
        </TabsContent>
        <TabsContent value="portfolio">
          <Portfolio projects={[]} isOwner={isOwner} userId={stagiaire.id} />
        </TabsContent>
        <TabsContent value="recommendations">
          <Recommendations userId={stagiaire.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
