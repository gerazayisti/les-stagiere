
import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Users, Building2, ArrowLeft } from "lucide-react";

const Inscription = () => {
  const [accountType, setAccountType] = useState<"stagiaire" | "entreprise">("stagiaire");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Link to="/connexion" className="inline-flex items-center text-gray hover:text-primary mb-8">
            <ArrowLeft size={20} className="mr-2" />
            Retour à la connexion
          </Link>

          <h1 className="text-3xl font-display font-bold text-center mb-8 animate-fade-in">
            Créer un compte
          </h1>

          {/* Account Type Selection */}
          <div className="bg-white rounded-lg p-1 flex mb-8 shadow-sm animate-slide-up">
            <button
              onClick={() => setAccountType("stagiaire")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${
                accountType === "stagiaire"
                  ? "bg-primary text-white"
                  : "text-gray hover:bg-gray-light"
              }`}
            >
              <Users size={20} />
              Stagiaire
            </button>
            <button
              onClick={() => setAccountType("entreprise")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors ${
                accountType === "entreprise"
                  ? "bg-primary text-white"
                  : "text-gray hover:bg-gray-light"
              }`}
            >
              <Building2 size={20} />
              Entreprise
            </button>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm animate-fade-in">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="mt-1 block w-full px-3 py-2 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="mt-1 block w-full px-3 py-2 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="exemple@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full px-3 py-2 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="mt-1 block w-full px-3 py-2 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-200 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray">
                  J'accepte les{" "}
                  <Link to="/conditions" className="text-primary hover:text-primary-dark">
                    conditions d'utilisation
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Créer mon compte
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
