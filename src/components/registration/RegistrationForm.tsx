
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff, WifiOff, ServerOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/lib/auth";
import { Link } from "react-router-dom";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface RegistrationFormProps {
  loading: boolean;
  formError: string | null;
  formData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  };
  emailAvailable: boolean | null;
  checkingEmail: boolean;
  passwordStrength: 'weak' | 'medium' | 'strong' | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (value: UserRole) => void;
  networkError?: boolean;
  databaseError?: boolean;
}

export function RegistrationForm({
  loading,
  formError,
  formData,
  emailAvailable,
  checkingEmail,
  passwordStrength,
  onSubmit,
  onInputChange,
  onRoleChange,
  networkError = false,
  databaseError = false
}: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getAlertVariant = () => {
    if (databaseError) return "warning";
    if (networkError) return "default";
    return "destructive";
  };

  const getAlertIcon = () => {
    if (databaseError) return <ServerOff className="h-4 w-4" />;
    if (networkError) return <WifiOff className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <Alert variant={getAlertVariant()}>
          {getAlertIcon()}
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Type de compte</Label>
        <Select
          value={formData.role}
          onValueChange={onRoleChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez votre profil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stagiaire">Stagiaire</SelectItem>
            <SelectItem value="entreprise">Entreprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          {formData.role === 'entreprise' ? "Nom de l'entreprise" : "Nom complet"}
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          required
          disabled={loading}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex justify-between">
          <span>Email</span>
          {emailAvailable === true && (
            <span className="text-xs text-green-500">Disponible</span>
          )}
          {emailAvailable === false && (
            <span className="text-xs text-red-500">Déjà utilisé</span>
          )}
        </Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={onInputChange}
            required
            disabled={loading}
            autoComplete="email"
            className={emailAvailable === false ? "border-red-300 pr-10" : ""}
          />
          {checkingEmail && (
            <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={onInputChange}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        {passwordStrength && (
          <PasswordStrengthIndicator strength={passwordStrength} />
        )}
      </div>

      <div className="flex items-center justify-end">
        <Link to="/connexion" className="text-sm text-primary hover:underline">
          Déjà un compte ? Se connecter
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || (formData.email.includes('@') && emailAvailable === false)}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "S'inscrire"
        )}
      </Button>

      {databaseError && (
        <div className="text-xs text-amber-600 text-center mt-2">
          Nous rencontrons actuellement des problèmes de connexion à notre base de données. 
          Si l'inscription échoue, veuillez réessayer dans quelques minutes.
        </div>
      )}
    </form>
  );
}
