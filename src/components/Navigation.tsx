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
      <div className="w-full max-w-7xl bg-white rounded-full shadow-lg px-6 py-2 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl">J</div>
          <span className="text-2xl font-bold text-gray-800">Les <span className="text-yellow-500">Stagiaires</span></span>
            </Link>

        {/* Menu principal (Desktop) */}
        <div className="hidden md:flex items-center gap-6 mx-8">
          <Link to="/" className="hover:text-yellow-500 transition-colors font-medium">Accueil</Link>
            <Link
              to="/stages"
            className="hover:text-yellow-500 transition-colors font-medium"
            >
              Offres de stages
            </Link>
            <Link
              to="/blog"
            className="hover:text-yellow-500 transition-colors font-medium"
            >
              Blog
            </Link>
            <Link
              to="/abonnement"
            className="hover:text-yellow-500 transition-colors font-medium"
            >
              Abonnement
            </Link>
            <Link
              to="/a-propos"
            className="hover:text-yellow-500 transition-colors font-medium"
            >
              À propos
            </Link>
          {/* Sous-menu Contact */}
          <div className="relative group">
            <button className="flex items-center gap-1 font-medium hover:text-yellow-500 transition-colors focus:outline-none">
              Contact
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
              <Link to="/contact" className="block px-4 py-2 hover:bg-gray-100">Contact principal</Link>
              {/* Ajoutez d'autres liens de contact ici si nécessaire */}
              <Link to="/contact-partenaire" className="block px-4 py-2 hover:bg-gray-100">Contact partenaire</Link>
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
                  className="w-56"
                  align="end"
                  sideOffset={5}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.user_metadata?.name || user?.email}
                      </p>
                      {user?.user_metadata?.name && (
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
                  {userRole === 'stagiaire' && (
                    <DropdownMenuItem
                      onClick={() => {
                        navigate("/mes-candidatures");
                        setIsOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      Mes candidatures
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/messagerie");
                      setIsOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    Messagerie
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
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
                <button className="h-10 px-6 rounded-full border border-yellow-400 text-yellow-500 font-semibold hover:bg-yellow-50 transition-colors">Se connecter</button>
              </Link>
              <Link to="/abonnement">
                <button className="h-10 px-6 rounded-full bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition-colors shadow">Abonnement</button>
              </Link>
              </div>
            )}
          {/* Bouton pour menu mobile */}
          <button className="md:hidden ml-2 p-2 rounded-full hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      {/* Menu mobile déroulant */}
        {isOpen && (
        <div className="fixed top-20 left-0 w-full bg-white shadow-lg rounded-b-3xl z-40 flex flex-col items-center py-6 gap-4 md:hidden animate-fade-in">
          <Suspense fallback={<Skeleton className="h-6 w-6" />}>
            <ThemeToggle />
          </Suspense>
          <Link to="/" className="font-medium" onClick={() => setIsOpen(false)}>Accueil</Link>
              <Link
                to="/stages"
            className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Offres de stages
              </Link>
              <Link
                to="/blog"
            className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/abonnement"
            className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Abonnement
              </Link>
              <Link
                to="/a-propos"
            className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
            className="font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
          <div className="w-full flex justify-center px-4"> {/* Wrapper for buttons and user info in mobile menu */}
            {!isAuthenticated && (
              <div className="flex flex-col space-y-2 w-full">
                <Link to="/connexion" onClick={() => setIsOpen(false)}>
                  <button className="h-10 px-6 rounded-full border border-yellow-400 text-yellow-500 font-semibold hover:bg-yellow-50 transition-colors w-full">Se connecter</button>
                </Link>
                <Link to="/abonnement" onClick={() => setIsOpen(false)}>
                  <button className="h-10 px-6 rounded-full bg-yellow-400 text-white font-semibold hover:bg-yellow-500 transition-colors w-full">Abonnement</button>
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="w-full">
                  <DropdownMenuSeparator />
                <div className="px-4 py-2 w-full">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(getUserDisplayName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user?.user_metadata?.name || user?.email}
                        </span>
                        {user?.user_metadata?.name && (
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
                      {userRole === 'stagiaire' && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            navigate("/mes-candidatures");
                            setIsOpen(false);
                          }}
                        >
                          Mes candidatures
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/messagerie");
                          setIsOpen(false);
                        }}
                      >
                        Messagerie
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                        navigate("/settings");
                          setIsOpen(false);
                        }}
                      >
                        Paramètres
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
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
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </nav>
  );
}
