import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/auth";
import { Loader2, ArrowLeft, Wrench, Languages, MapPin, Briefcase, Star, Building2 } from "lucide-react";
import { TagSelector } from "@/components/ui/tag-selector";
import {
  SKILLS_OPTIONS,
  LANGUAGES_OPTIONS,
  DOMAINS_OPTIONS,
  BENEFITS_OPTIONS,
  LOCATIONS_OPTIONS,
} from "./registrationOptions";

interface RegistrationStep3Props {
  loading: boolean;
  role: UserRole;
  formData: {
    skills?: string[];
    languages?: string[];
    preferred_domains?: string[]
    preferred_locations?: string[];
    benefits?: string[];
  };
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onTagsChange: (field: string, values: string[]) => void;
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium">
      <Icon className="h-4 w-4 text-primary" />
      {text}
    </span>
  );
}

export function RegistrationStep3Form({
  loading,
  role,
  formData,
  onBack,
  onSubmit,
  onTagsChange,
}: RegistrationStep3Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
    >
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
          <h3 className="text-base font-semibold">
            {role === "stagiaire" ? "Vos préférences" : "Ce que vous offrez"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Étape 3 / 3 — Sélectionnez ou tapez pour ajouter
          </p>
        </div>
      </div>

      {/* ─── STAGIAIRE ─── */}
      {role === "stagiaire" && (
        <>
          <TagSelector
            label={<SectionLabel icon={Wrench} text="Compétences" />}
            placeholder="Ex: React, Figma..."
            options={SKILLS_OPTIONS}
            selected={formData.skills || []}
            onChange={(v) => onTagsChange("skills", v)}
            colorScheme="primary"
            allowCustom={true}
          />

          <TagSelector
            label={<SectionLabel icon={Languages} text="Langues parlées" />}
            placeholder="Ex: Français, Anglais..."
            options={LANGUAGES_OPTIONS}
            selected={formData.languages || []}
            onChange={(v) => onTagsChange("languages", v)}
            colorScheme="primary"
            allowCustom={false}
          />

          <TagSelector
            label={<SectionLabel icon={MapPin} text="Lieux préférés" />}
            placeholder="Ex: Douala, Remote..."
            options={LOCATIONS_OPTIONS}
            selected={formData.preferred_locations || []}
            onChange={(v) => onTagsChange("preferred_locations", v)}
            colorScheme="primary"
            allowCustom={true}
            maxItems={5}
          />

          <TagSelector
            label={<SectionLabel icon={Briefcase} text="Secteurs qui m'intéressent" />}
            placeholder="Ex: Technologie, Finance..."
            options={DOMAINS_OPTIONS}
            selected={formData.preferred_domains || []}
            onChange={(v) => onTagsChange("preferred_domains", v)}
            colorScheme="primary"
            allowCustom={false}
            maxItems={4}
          />
        </>
      )}

      {/* ─── ENTREPRISE ─── */}
      {role === "entreprise" && (
        <>
          <TagSelector
            label={<SectionLabel icon={Star} text="Avantages proposés" />}
            placeholder="Ex: Télétravail, Mutuelle..."
            options={BENEFITS_OPTIONS}
            selected={formData.benefits || []}
            onChange={(v) => onTagsChange("benefits", v)}
            colorScheme="primary"
            allowCustom={true}
          />

          <TagSelector
            label={<SectionLabel icon={Building2} text="Villes où vous recrutez" />}
            placeholder="Ex: Douala, Yaoundé..."
            options={LOCATIONS_OPTIONS}
            selected={formData.preferred_locations || []}
            onChange={(v) => onTagsChange("preferred_locations", v)}
            colorScheme="primary"
            allowCustom={true}
            maxItems={6}
          />
        </>
      )}

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finalisation...
            </>
          ) : (
            "Créer mon compte"
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Ces préférences peuvent être modifiées depuis votre profil.
        </p>
      </div>
    </form>
  );
}
