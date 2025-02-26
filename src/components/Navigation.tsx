
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-display font-bold text-primary">Les Stagiaires</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/stages" className="text-gray hover:text-primary transition-colors">
              Offres de stages
            </Link>
            <Link to="/entreprises" className="text-gray hover:text-primary transition-colors">
              Entreprises
            </Link>
            <Link to="/connexion" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
              Connexion
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/stages"
                className="block px-3 py-2 text-gray hover:bg-gray-light rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Offres de stages
              </Link>
              <Link
                to="/entreprises"
                className="block px-3 py-2 text-gray hover:bg-gray-light rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Entreprises
              </Link>
              <Link
                to="/connexion"
                className="block px-3 py-2 text-primary hover:bg-gray-light rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
