import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { auth, UserRole } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Inscription() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "stagiaire" as UserRole,
  })

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || null;
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath();
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }

      if (user.role === 'entreprise') {
        navigate(`/entreprises/${user.id}`);
      } else if (user.role === 'stagiaire') {
        navigate(`/stagiaires/${user.id}`);
      } else {
        navigate('/complete-profile');
      }
      
      toast.info("Vous êtes déjà connecté", {
        description: "Redirection en cours..."
      });
    }
  }, [isAuthenticated, user, navigate, location.search]);

  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) {
      return 'weak';
    } else if (password.length < 10) {
      return 'medium';
    } else {
      return 'strong';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    try {
      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        setFormError("Veuillez entrer une adresse email valide");
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setFormError("Le mot de passe doit contenir au moins 8 caractères");
        setLoading(false);
        return;
      }

      if (formData.name.trim().length < 2) {
        setFormError(formData.role === 'entreprise' 
          ? "Le nom de l'entreprise est trop court" 
          : "Votre nom est trop court");
        setLoading(false);
        return;
      }
      
      console.log("Tentative d'inscription avec les données:", {
        ...formData,
        password: "***"
      });
      
      try {
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, retryCount * 300));
        }

        const result = await auth.signUp(formData);
        
        if (result.success) {
          toast.success("Inscription réussie !", {
            description: "Veuillez vérifier votre email pour continuer."
          });

          setTimeout(() => {
            navigate('/connexion');
          }, 1500);
        }
      } catch (error: any) {
        console.error("Erreur lors de l'inscription:", error);
        
        if (error.message?.includes("Erreur serveur")) {
          setRetryCount(prev => prev + 1);
          
          if (retryCount < 2) {
            toast.error("Problème de connexion", {
              description: "Nouvelle tentative en cours..."
            });
            
            setLoading(false);
            setTimeout(() => {
              handleSubmit(e);
            }, 1000);
            return;
          }
        }
        
        if (error.message) {
          setFormError(error.message);
        } else {
          setFormError("Une erreur est survenue lors de l'inscription");
        }
      }
      
    } catch (error: any) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      setFormError(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte pour accéder à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de compte</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => 
                    setFormData({ ...formData, role: value })
                  }
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
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
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
                  <div className="mt-1">
                    <div className="flex gap-1 h-1">
                      <div className={`flex-1 rounded-full ${
                        passwordStrength === 'weak' ? 'bg-red-500' : 
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className={`flex-1 rounded-full ${
                        passwordStrength === 'weak' ? 'bg-gray-200' : 
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className={`flex-1 rounded-full ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {passwordStrength === 'weak' ? 'Mot de passe faible' : 
                       passwordStrength === 'medium' ? 'Mot de passe moyen' : 'Mot de passe fort'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link to="/connexion" className="text-sm text-primary hover:underline">
                  Déjà un compte ? Se connecter
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
