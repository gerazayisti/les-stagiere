import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export default function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || null;
  };

  useEffect(() => {
    if (isAuthenticated && user && !loginInProgress) {
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
  }, [isAuthenticated, user, navigate, location.search, loginInProgress]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const emailConfirmed = params.get('email_confirmed');
    
    if (error === 'session_expired') {
      setFormError("Votre session a expiré. Veuillez vous reconnecter.");
    } else if (error === 'auth_required') {
      setFormError("Vous devez être connecté pour accéder à cette page.");
    }

    if (emailConfirmed === 'true') {
      toast.success("Email confirmé avec succès", {
        description: "Vous pouvez maintenant vous connecter"
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginInProgress(true);
    setFormError(null);

    try {
      toast.loading("Connexion en cours...", { id: "login-toast" });
      
      const { user } = await auth.signIn(formData);
      
      toast.success("Connexion réussie", {
        id: "login-toast",
        description: `Bienvenue, ${user.user_metadata?.name || user.email}`
      });
      
      if (refreshUser) {
        await refreshUser();
      }
      
      const redirectPath = getRedirectPath();
      
      localStorage.setItem('preAuthUserRole', user.user_metadata?.role || 'inconnu');
      localStorage.setItem('preAuthUserName', user.user_metadata?.name || user.email);
      
      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.user_metadata?.role === 'entreprise') {
        navigate(`/entreprises/${user.id}`);
      } else if (user.user_metadata?.role === 'stagiaire') {
        navigate(`/stagiaires/${user.id}`);
      } else {
        navigate('/complete-profile');
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      toast.error("Échec de connexion", {
        id: "login-toast",
        description: error.message || "Une erreur s'est produite lors de la connexion"
      });
      
      setFormError(error.message || "Une erreur s'est produite lors de la connexion");
      setLoginInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formError) {
      setFormError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre compte pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-sm text-primary hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            <span className="text-muted-foreground">Vous n'avez pas de compte ? </span>
            <Link to="/inscription" className="text-primary hover:underline font-medium">
              Créer un compte
            </Link>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            En vous connectant, vous acceptez nos{" "}
            <Link to="/conditions" className="hover:underline">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link to="/confidentialite" className="hover:underline">
              Politique de confidentialité
            </Link>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
