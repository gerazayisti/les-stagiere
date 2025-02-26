import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Les Stagiaires - Your First Step</h3>
            <p className="text-muted-foreground">
              Votre plateforme de référence pour les stages et l'emploi. Connectez-vous avec les meilleurs talents et entreprises.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/stages" className="text-muted-foreground hover:text-foreground transition-colors">
                  Offres
                </Link>
              </li>
              <li>
                <Link to="/blocs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blocs
                </Link>
              </li>
              <li>
                <Link to="/abonnement" className="text-muted-foreground hover:text-foreground transition-colors">
                  Abonnement
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guide des études
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email : contact@lesstagiaires.com</li>
              <li>Téléphone : +695183768</li>
              <li>Adresse : Yaoundé, Cameroun</li>
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Les Stagiaires. Tous droits réservés.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Mentions légales
              </Link>
              <Link to="/confidentialite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
