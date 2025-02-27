
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
    bio: '',
    description: ''
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
      const dataToSubmit = authRole === 'stagiaire' 
        ? { id: user.id, name: formData.name, bio: formData.bio } 
        : { id: user.id, name: formData.name, description: formData.description };

      const { error } = await supabase
        .from(table)
        .upsert(dataToSubmit);

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
          Veuillez remplir les informations suivantes pour compléter votre profil :
          {missingFields.length > 0 && (
            <span className="text-red-500 block mt-2">
              Champs manquants : {missingFields.join(', ')}
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div>
            <Label htmlFor="name">Nom{authRole === 'entreprise' ? " de l'entreprise" : " complet"}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={authRole === 'entreprise' ? "Nom de votre entreprise" : "Votre nom complet"}
              required
            />
          </div>

          {/* Bio ou Description */}
          {authRole === 'stagiaire' ? (
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Décrivez votre parcours et vos objectifs professionnels..."
                className="h-32"
                required
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre entreprise, ses activités et sa mission..."
                className="h-32"
                required
              />
            </div>
          )}

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
