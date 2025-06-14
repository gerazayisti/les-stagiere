import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, loading, signOut, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

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
    
    if (userRole === 'entreprise') {
      navigate(`/entreprises/${user.id}`);
    } else if (userRole === 'stagiaire') {
      navigate(`/stagiaires/${user.id}`);
    } else {
      navigate('/profil');
    }
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      const success = await signOut();
      
      if (success) {
        toast.success("Vous avez été déconnecté avec succès");
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    } finally {
      setIsSigningOut(false);
    }
  };

  const getAvatarUrl = () => {
    if (!user) return "";
    if (userRole === "entreprise") {
      return user.user_metadata?.logo_url || "";
    }
    return user.user_metadata?.avatar_url || "";
  };

  const renderAvatar = () => {
    const avatarUrl = getAvatarUrl();
    
    if (loading) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }
    
    return (
      <Avatar>
        {avatarUrl && (
          <AvatarImage 
            src={avatarUrl} 
            alt={getUserDisplayName()} 
            onLoad={() => setAvatarLoaded(true)}
            onError={() => setAvatarLoaded(false)}
          />
        )}
        <AvatarFallback className="bg-primary/10">
          {getInitials(getUserDisplayName())}
        </AvatarFallback>
      </Avatar>
    );
  };

  useEffect(() => {
    console.log("Navigation state:", { user, userRole, isAuthenticated, loading });
  }, [user, userRole, isAuthenticated, loading]);

  return (
    <nav className="fixed w-full flex justify-center items-center py-4 z-50 bg-transparent">
      <div className="w-full max-w-7xl bg-white dark:bg-gray-800 rounded-full shadow-lg px-6 py-2 flex justify-between items-center h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/les-stagiere.jpg" 
            alt="Les Stagiere Logo" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-2xl font-bold text-primary hidden md:block">Les <span className="text-secondary">Stagiaires</span></span>
            </Link>

        {/* Menu principal (Desktop) */}
        <div className="hidden md:flex items-center gap-6 mx-8">
          <Link to="/" className="hover:text-secondary transition-colors font-medium text-gray-700 dark:text-gray-200">Accueil</Link>
          <Link to="/stages" className="hover:text-secondary transition-colors font-medium text-gray-700 dark:text-gray-200">
              Offres de stages
            </Link>
          <Link to="/blog" className="hover:text-secondary transition-colors font-medium text-gray-700 dark:text-gray-200">
              Blog
            </Link>
          <Link to="/abonnement" className="hover:text-secondary transition-colors font-medium text-gray-700 dark:text-gray-200">
              Abonnement
            </Link>
          <Link to="/a-propos" className="hover:text-secondary transition-colors font-medium text-gray-700 dark:text-gray-200">
              À propos
            </Link>
          {/* Sous-menu Contact */}
          <div className="relative group">
            <button className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors focus:outline-none">
              Contact
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
              <Link to="/contact" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Contact principal</Link>
              <Link to="/contact-partenaire" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">Contact partenaire</Link>
            </div>
          </div>
        </div>

        {/* Actions à droite (Desktop) */}
        <div className="flex items-center gap-3">
            <Suspense fallback={<Skeleton className="h-8 w-8" />}>
              <ThemeToggle />
            </Suspense>
            {loading ? (
            <Skeleton className="h-10 w-24 rounded-full" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    {renderAvatar()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                className="w-56 bg-white dark:bg-gray-800"
                  align="end"
                  sideOffset={5}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.user_metadata?.name || user?.email}
                      </p>
                      {user?.user_metadata?.name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                  className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Mon profil
                  </DropdownMenuItem>
                  {userRole === 'stagiaire' && (
                    <DropdownMenuItem
                      onClick={() => {
                        navigate("/mes-candidatures");
                        setIsOpen(false);
                      }}
                    className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Mes candidatures
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/messagerie");
                      setIsOpen(false);
                    }}
                  className="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Messagerie
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                  <Link to="/settings" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <span className="animate-pulse">Déconnexion en cours...</span>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Se déconnecter
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-4">
              <Link to="/connexion">
                <button className="h-10 px-6 rounded-full border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors dark:border-secondary dark:text-secondary dark:hover:bg-secondary/10">
                  Se connecter
                </button>
              </Link>
              </div>
            )}
          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-200" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
          </div>
        </div>

      {/* Menu mobile overlay */}
        {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg p-6 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <img 
                    src="/les-stagiere.jpg" 
                    alt="Les Stagiere Logo" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xl font-bold text-primary">Les <span className="text-secondary">Stagiaires</span></span>
                </Link>
                <button
                onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                <Link to="/" className="font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>
                  Accueil
                </Link>
                <Link to="/stages" className="font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>
                Offres de stages
              </Link>
                <Link to="/blog" className="font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>
                Blog
              </Link>
                <Link to="/abonnement" className="font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>
                Abonnement
              </Link>
                <Link to="/a-propos" className="font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>
                À propos
              </Link>
                <Link to="/contact" className="font-medium text-gray-700 dark:text-gray-200 hover:text-secondary transition-colors" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
                      </div>

              <div className="mt-auto">
                {!isAuthenticated && (
                  <div className="flex flex-col space-y-2 w-full">
                    <Link to="/connexion" onClick={() => setIsOpen(false)}>
                      <button className="h-10 px-6 rounded-full border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors w-full dark:border-secondary dark:text-secondary dark:hover:bg-secondary/10">
                        Se connecter
                      </button>
                    </Link>
                    <Link to="/abonnement" onClick={() => setIsOpen(false)}>
                      <button className="h-10 px-6 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors w-full">
                        Abonnement
                      </button>
                    </Link>
                  </div>
                )}
                </div>
            </div>
            </div>
          </div>
        )}
    </nav>
  );
}
