
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StagiaireData {
  name: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  education: string;
  disponibility: string;
}

interface EditProfileFormProps {
  initialData: StagiaireData;
  onSubmit: (data: StagiaireData) => void;
  onCancel: () => void;
  onAvatarUpload?: (file: File) => void;
}

export function EditProfileForm({
  initialData,
  onSubmit,
  onCancel,
  onAvatarUpload,
}: EditProfileFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      bio: formData.get("bio") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      education: formData.get("education") as string,
      disponibility: formData.get("disponibility") as string,
    };
    onSubmit(data);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onAvatarUpload) {
      onAvatarUpload(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {onAvatarUpload && (
          <div className="space-y-2">
            <Label htmlFor="avatar">Photo de profil</Label>
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <p className="text-sm text-muted-foreground">
              Téléchargez une image pour personnaliser votre profil.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData.name}
              placeholder="Jean Dupont"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Titre professionnel</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData.title}
              placeholder="Développeur Full Stack Junior"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData.email}
              placeholder="jean.dupont@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialData.phone}
              placeholder="+237 6XX XX XX XX"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            name="location"
            defaultValue={initialData.location}
            placeholder="Yaoundé, Cameroun"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="education">Formation</Label>
          <Input
            id="education"
            name="education"
            defaultValue={initialData.education}
            placeholder="Master en Informatique"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disponibility">Disponibilité</Label>
          <Select name="disponibility" defaultValue={initialData.disponibility}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immédiate</SelectItem>
              <SelectItem value="1month">Dans 1 mois</SelectItem>
              <SelectItem value="2months">Dans 2 mois</SelectItem>
              <SelectItem value="3months">Dans 3 mois</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={initialData.bio}
            placeholder="Décrivez votre parcours et vos objectifs professionnels..."
            className="h-32"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer les modifications</Button>
      </div>
    </form>
  );
}
