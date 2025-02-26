import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation({ isPremium }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-background/95 backdrop-blur-sm z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-display font-bold text-foreground">Les Stagiaires</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/stages" className="text-muted-foreground hover:text-foreground transition-colors">
              Offres de stages
            </Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            {isPremium && (
              <Link to="/messagerie" className="text-muted-foreground hover:text-foreground transition-colors">
                Messagerie
              </Link>
            )}
            <Link to="/abonnement" className="text-muted-foreground hover:text-foreground transition-colors">
              Abonnement
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/a-propos" className="text-muted-foreground hover:text-foreground transition-colors">
              À propos
            </Link>
            <ThemeToggle />
            <Link to="/connexion" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Connexion
            </Link>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
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
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Offres de stages
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              {isPremium && (
                <Link
                  to="/messagerie"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Messagerie
                </Link>
              )}
              <Link
                to="/abonnement"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Abonnement
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/a-propos"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/connexion"
                className="block px-3 py-2 text-primary-foreground bg-primary hover:bg-primary/90 rounded-md"
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
}
