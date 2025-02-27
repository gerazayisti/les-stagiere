import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useAuth } from '@/hooks/useAuth';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole: authRole } = useAuth();
  const { missingFields, profile, loading: checkingProfile } = useProfileCompletion({
    userId: user?.id,
    userRole: authRole
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: '',
    bio: '',
    education: '',
    skills: [],
    languages: [],
    preferred_locations: [],
    description: '',
    industry: '',
    size: '',
    company_culture: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(prevData => ({
        ...prevData,
        ...profile
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !authRole) return;

    try {
      setLoading(true);

      const table = authRole === 'stagiaire' ? 'stagiaires' : 'entreprises';
      const { error } = await supabase
        .from(table)
        .upsert({
          id: user.id,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour avec succès",
      });

      navigate('/profil');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (name: string, value: string) => {
    const array = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [name]: array
    }));
  };

  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Compléter votre profil</h1>
        <p className="text-gray-600 mb-6">
          Veuillez remplir les champs suivants pour compléter votre profil :
          {missingFields.length > 0 && (
            <span className="text-red-500 block mt-2">
              Champs manquants : {missingFields.join(', ')}
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champs communs */}
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {authRole === 'stagiaire' ? (
            <>
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="education">Formation</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="languages">Langues (séparées par des virgules)</Label>
                <Input
                  id="languages"
                  name="languages"
                  value={formData.languages.join(', ')}
                  onChange={(e) => handleArrayInputChange('languages', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="preferred_locations">Lieux préférés (séparés par des virgules)</Label>
                <Input
                  id="preferred_locations"
                  name="preferred_locations"
                  value={formData.preferred_locations.join(', ')}
                  onChange={(e) => handleArrayInputChange('preferred_locations', e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="size">Taille de l'entreprise</Label>
                <Input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company_culture">Culture d'entreprise</Label>
                <Textarea
                  id="company_culture"
                  name="company_culture"
                  value={formData.company_culture}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
