
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CompanyData {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  email: string;
  phone?: string;
}

interface EditEntrepriseFormProps {
  entreprise: CompanyData;
  onSubmit: (data: Partial<CompanyData>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditEntrepriseForm({ entreprise, onSubmit, onCancel, isLoading = false }: EditEntrepriseFormProps) {
  const [formData, setFormData] = useState<CompanyData>(entreprise);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);

      // Vérifier la taille et le type du fichier
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error("Le fichier est trop volumineux (max: 5MB)");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Seules les images sont acceptées");
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split(".").pop();
      const fileName = `${entreprise.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Uploader le fichier
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from("public")
        .getPublicUrl(filePath);

      // Mettre à jour le state
      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));
      toast({
        title: "Succès",
        description: "Logo téléchargé avec succès",
      });

    } catch (error: any) {
      console.error("Erreur lors du téléchargement du logo:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger le logo",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="logo_url">Logo de l'entreprise</Label>
          <div className="mt-1 flex items-center gap-4">
            <img
              src={formData.logo_url || "https://via.placeholder.com/150"}
              alt="Logo de l'entreprise"
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div>
              <input 
                type="file" 
                id="logo-upload" 
                onChange={handleLogoUpload} 
                className="hidden"
                accept="image/*"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById("logo-upload")?.click()}
                disabled={uploadLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadLoading ? "Téléchargement..." : "Changer le logo"}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Nom de l'entreprise</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1"
            rows={4}
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
            className="mt-1"
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
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website || ""}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading || uploadLoading}>
          {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
