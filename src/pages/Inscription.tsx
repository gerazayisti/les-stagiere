
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, UserRole } from "@/lib/auth";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { RegistrationStep2Form } from "@/components/registration/RegistrationStep2Form";
import { RegistrationStep3Form } from "@/components/registration/RegistrationStep3Form";
import { VerificationEmailSent } from "@/components/registration/VerificationEmailSent";

export default function Inscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - auth fields
    email: "",
    password: "",
    name: "",
    role: "stagiaire" as UserRole,
    // Step 2 - Shared
    location: "",
    // Step 2 - Stagiaire (matches stagiaires table)
    title: "",
    bio: "",
    search_status: "",
    disponibility: "",
    linkedin_url: "",
    skills: [] as string[],
    languages: [] as string[],
    preferred_locations: [] as string[],
    preferred_domains: [] as string[],
    // Step 2 - Entreprise (matches entreprises table)
    industry: "",
    description: "",
    company_culture: "",
    size: "",
    founded_year: "",
    website: "",
    benefits: [] as string[],
  });

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

  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@') && formData.email.includes('.')) {
        setCheckingEmail(true);
        setEmailAvailable(null);
        
        try {
          const timeoutId = setTimeout(async () => {
            try {
              const exists = await auth.checkEmailExists(formData.email);
              setEmailAvailable(!exists);
            } catch (error) {
              console.warn("Vérification d'email échouée:", error);
              setEmailAvailable(null);
            } finally {
              setCheckingEmail(false);
            }
          }, 800);
          
          return () => clearTimeout(timeoutId);
        } catch (error) {
          console.error("Erreur lors de la vérification de l'email:", error);
          setCheckingEmail(false);
        }
      } else {
        setEmailAvailable(null);
      }
    };
    
    checkEmail();
  }, [formData.email]);

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
      setNetworkError(false);
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNetworkError(false);

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setFormError("Veuillez entrer une adresse email valide");
      return;
    }

    if (formData.password.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (formData.name.trim().length < 2) {
      setFormError(formData.role === 'entreprise' 
        ? "Le nom de l'entreprise est trop court" 
        : "Votre nom est trop court");
      return;
    }

    setStep(2);
  };

  const handleArrayChange = (name: string, value: string) => {
    const arr = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [name]: arr
    }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (field: string, values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setNetworkError(false);

    try {
      const result = await auth.signUp(formData);

      if (result.success) {
        setEmailSent(true);
        toast.success("Inscription réussie !", {
          description: "Veuillez vérifier votre email pour confirmer votre compte"
        });
      } else if (result.error) {
        setFormError(result.error.message);
        // Check if it's a network error
        if (result.error.isNetworkError) {
          setNetworkError(true);
        }
      }
    } catch (error: any) {
      console.error("Exception lors de la soumission du formulaire:", error);
      
      // Check for network errors
      if (error.message === "Failed to fetch" || 
          error.name === "TypeError" || 
          error.message?.includes("network") ||
          error.message?.includes("ERR_NAME_NOT_RESOLVED")) {
        setFormError("Problème de connexion à notre serveur. Veuillez vérifier votre connexion internet et réessayer.");
        setNetworkError(true);
      } else {
        setFormError(error.message || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email) {
      setFormError("Veuillez entrer une adresse email");
      return;
    }
    
    try {
      setLoading(true);
      await auth.resendConfirmationEmail(formData.email);
      toast.success("Email de confirmation renvoyé", {
        description: "Veuillez vérifier votre boîte mail"
      });
    } catch (error: any) {
      console.error("Erreur lors du renvoi de l'email:", error);
      
      // Check if it's a network error
      if (error.message === "Failed to fetch" || 
          error.name === "TypeError" || 
          error.message?.includes("network") ||
          error.message?.includes("ERR_NAME_NOT_RESOLVED")) {
        setFormError("Problème de connexion à notre serveur. Veuillez vérifier votre connexion internet et réessayer.");
        setNetworkError(true);
      } else {
        setFormError("Impossible de renvoyer l'email de confirmation");
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <VerificationEmailSent
          email={formData.email}
          loading={loading}
          onResendEmail={handleResendEmail}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 bg-primary" : s < step ? "w-4 bg-primary/50" : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[460px] pr-4">
            {step === 1 && (
              <RegistrationForm
                loading={loading}
                formError={formError}
                formData={formData}
                emailAvailable={emailAvailable}
                checkingEmail={checkingEmail}
                passwordStrength={passwordStrength}
                onSubmit={handleNextStep}
                onInputChange={handleInputChange}
                onRoleChange={(value) => setFormData({ ...formData, role: value })}
                networkError={networkError}
              />
            )}
            {step === 2 && (
              <RegistrationStep2Form
                loading={loading}
                role={formData.role}
                formData={formData}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                onFieldChange={handleFieldChange}
              />
            )}
            {step === 3 && (
              <RegistrationStep3Form
                loading={loading}
                role={formData.role}
                formData={formData}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                onTagsChange={handleTagsChange}
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
