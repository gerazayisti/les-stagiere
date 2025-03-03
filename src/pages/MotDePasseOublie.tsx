
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Mail, Loader2, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MotDePasseOublie = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation de l'email
      if (!email || !email.includes('@')) {
        throw new Error("Veuillez saisir une adresse email valide");
      }

      // Appel à la fonction de réinitialisation du mot de passe
      await auth.resetPassword(email);
      
      // Si tout s'est bien passé
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Link to="/connexion" className="inline-flex items-center text-gray hover:text-primary mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Retour à la connexion
          </Link>

          <h1 className="text-3xl font-display font-bold text-center mb-4 animate-fade-in">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray text-center mb-8 animate-fade-in">
            Entrez votre adresse email pour réinitialiser votre mot de passe
          </p>

          <div className="bg-white rounded-lg p-8 shadow-sm animate-fade-in">
            {success ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
                  <p className="font-medium">Email envoyé !</p>
                  <p className="mt-1 text-sm">
                    Si un compte est associé à cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/connexion')}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray">
                    Adresse email
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-3 py-2 pl-10 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="exemple@email.com"
                      disabled={loading}
                    />
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer les instructions"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotDePasseOublie;
