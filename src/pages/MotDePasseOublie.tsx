
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Mail } from "lucide-react";

const MotDePasseOublie = () => {
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
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray">
                  Adresse email
                </label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    id="email"
                    className="block w-full px-3 py-2 pl-10 bg-gray-light border border-gray-200 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="exemple@email.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Envoyer les instructions
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotDePasseOublie;
