import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface EditEntrepriseFormProps {
  initialData: {
    nom: string;
    logo: string;
    description: string;
    secteur: string;
    taille: string;
    localisation: string;
    site: string;
    email: string;
    telephone: string;
  };
  onSubmit: (data: any) => void;
}

export function EditEntrepriseForm({ initialData, onSubmit }: EditEntrepriseFormProps) {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="logo">Logo de l'entreprise</Label>
          <div className="mt-1 flex items-center gap-4">
            <img
              src={formData.logo}
              alt="Logo de l'entreprise"
              className="h-16 w-16 rounded-lg object-cover"
            />
            <Button type="button" variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Changer le logo
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="nom">Nom de l'entreprise</Label>
          <Input
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className="mt-1"
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
          />
        </div>

        <div>
          <Label htmlFor="secteur">Secteur d'activité</Label>
          <Input
            id="secteur"
            name="secteur"
            value={formData.secteur}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="taille">Taille de l'entreprise</Label>
          <Input
            id="taille"
            name="taille"
            value={formData.taille}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="localisation">Localisation</Label>
          <Input
            id="localisation"
            name="localisation"
            value={formData.localisation}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="site">Site web</Label>
          <Input
            id="site"
            name="site"
            type="url"
            value={formData.site}
            onChange={handleInputChange}
            className="mt-1"
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
          />
        </div>

        <div>
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            value={formData.telephone}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
