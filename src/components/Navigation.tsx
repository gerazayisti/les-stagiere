import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { auth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { ThemeToggle } from "./ThemeToggle";

export default function Navigation() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await auth.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Obtenir les initiales du nom ou de l'email
  const getInitials = (text: string) => {
    if (!text) return "??";
    if (text.includes("@")) {
      return text.split("@")[0].slice(0, 2).toUpperCase();
    }
    return text
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return user.user_metadata?.name || user.email || "";
  };

  const handleProfileClick = () => {
    if (!user) return;
    
    const userRole = user.user_metadata?.role;
    const userId = user.id;

    if (userRole === 'entreprise') {
      navigate(`/entreprises/${userId}`);
    } else if (userRole === 'stagiaire') {
      navigate(`/stagiaires/${userId}`);
    } else {
      navigate('/profil');
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full bg-background/95 backdrop-blur-sm z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-display font-bold text-foreground">
                Les Stagiaires
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/stages"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Offres de stages
            </Link>
            <Link
              to="/blog"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/abonnement"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Abonnement
            </Link>
            <Link
              to="/a-propos"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              À propos
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <ThemeToggle />

            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-primary/10">
                        {getInitials(getUserDisplayName())}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  sideOffset={5}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.user_metadata?.name || user.email}
                      </p>
                      {user.user_metadata?.name && (
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="cursor-pointer"
                  >
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/parametres")}
                    className="cursor-pointer"
                  >
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/connexion")}
                  className="hover:bg-muted/50"
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => navigate("/inscription")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Inscription
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/stages"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Offres de stages
              </Link>
              <Link
                to="/blog"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/abonnement"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Abonnement
              </Link>
              <Link
                to="/a-propos"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              {user ? (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(getUserDisplayName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.user_metadata?.name || user.email}
                        </span>
                        {user.user_metadata?.name && (
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleProfileClick}
                      >
                        Mon profil
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/parametres");
                          setIsOpen(false);
                        }}
                      >
                        Paramètres
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/connexion");
                      setIsOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/inscription");
                      setIsOpen(false);
                    }}
                  >
                    Inscription
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
