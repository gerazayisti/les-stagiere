import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserRole } from "@/lib/auth";
import { Loader2, ArrowLeft, User2, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegistrationStep2Props {
  loading: boolean;
  role: UserRole;
  formData: Record<string, any>;
  onBack: () => void;
  onNext: () => void;
  onFieldChange: (name: string, value: string) => void;
}

export function RegistrationStep2Form({
  loading,
  role,
  formData,
  onBack,
  onNext,
  onFieldChange,
}: RegistrationStep2Props) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h3 className="text-base font-semibold flex items-center gap-1.5">
            {role === "stagiaire" ? (
              <><User2 className="h-4 w-4 text-primary" /> Votre profil</>
            ) : (
              <><Building2 className="h-4 w-4 text-primary" /> Profil de l'entreprise</>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            Étape 2 / 3 — Informations de base
          </p>
        </div>
      </div>

      {/* ─── STAGIAIRE FIELDS ─── */}
      {role === "stagiaire" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="title">Titre / Poste visé</Label>
              <Input
                id="title"
                placeholder="Ex: Développeur React"
                value={formData.title || ""}
                onChange={(e) => onFieldChange("title", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Ex: Douala"
                value={formData.location || ""}
                onChange={(e) => onFieldChange("location", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="bio">Présentation (bio)</Label>
            <Textarea
              id="bio"
              placeholder="Décrivez-vous en quelques mots..."
              value={formData.bio || ""}
              onChange={(e) => onFieldChange("bio", e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="search_status">Statut de recherche</Label>
              <Select
                value={formData.search_status || ""}
                onValueChange={(v) => onFieldChange("search_status", v)}
                disabled={loading}
              >
                <SelectTrigger id="search_status">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activement en recherche</SelectItem>
                  <SelectItem value="open">Ouvert aux opportunités</SelectItem>
                  <SelectItem value="passive">Pas en recherche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="disponibility">Disponibilité</Label>
              <Select
                value={formData.disponibility || ""}
                onValueChange={(v) => onFieldChange("disponibility", v)}
                disabled={loading}
              >
                <SelectTrigger id="disponibility">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiate</SelectItem>
                  <SelectItem value="1_month">Dans 1 mois</SelectItem>
                  <SelectItem value="3_months">Dans 3 mois</SelectItem>
                  <SelectItem value="negotiable">À négocier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="linkedin_url">
              LinkedIn{" "}
              <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Input
              id="linkedin_url"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin_url || ""}
              onChange={(e) => onFieldChange("linkedin_url", e.target.value)}
              disabled={loading}
              type="url"
            />
          </div>
        </>
      )}

      {/* ─── ENTREPRISE FIELDS ─── */}
      {role === "entreprise" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="industry">Secteur d'activité</Label>
              <Input
                id="industry"
                placeholder="Ex: Tech, Santé, Finance..."
                value={formData.industry || ""}
                onChange={(e) => onFieldChange("industry", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Ex: Douala"
                value={formData.location || ""}
                onChange={(e) => onFieldChange("location", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description de l'entreprise</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre entreprise, votre mission, vos valeurs..."
              value={formData.description || ""}
              onChange={(e) => onFieldChange("description", e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="size">Taille de l'entreprise</Label>
              <Select
                value={formData.size || ""}
                onValueChange={(v) => onFieldChange("size", v)}
                disabled={loading}
              >
                <SelectTrigger id="size">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">Startup (1-10)</SelectItem>
                  <SelectItem value="11-50">PME (11-50)</SelectItem>
                  <SelectItem value="51-200">Moyenne (51-200)</SelectItem>
                  <SelectItem value="201-500">Grande (201-500)</SelectItem>
                  <SelectItem value="500+">Très grande (500+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="founded_year">Année de fondation</Label>
              <Input
                id="founded_year"
                placeholder="Ex: 2015"
                type="number"
                min={1900}
                max={2026}
                value={formData.founded_year || ""}
                onChange={(e) => onFieldChange("founded_year", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="company_culture">Culture d'entreprise</Label>
            <Textarea
              id="company_culture"
              placeholder="Décrivez l'ambiance, les valeurs, le mode de travail..."
              value={formData.company_culture || ""}
              onChange={(e) => onFieldChange("company_culture", e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="website">
              Site web{" "}
              <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Input
              id="website"
              placeholder="https://..."
              type="url"
              value={formData.website || ""}
              onChange={(e) => onFieldChange("website", e.target.value)}
              disabled={loading}
            />
          </div>
        </>
      )}

      <Button type="button" className="w-full mt-4" onClick={onNext} disabled={loading}>
        Continuer →
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Ces informations pourront être complétées depuis votre profil.
      </p>
    </div>
  );
}
