
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import { initAuthListener } from '@/lib/auth';
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import OffresStages from "./pages/OffresStages";
import DetailStage from "./pages/DetailStage";
import ProfilStagiaire from "./pages/ProfilStagiaire";
import ProfilEntreprise from "./pages/ProfilEntreprise";
import Contact from "./pages/Contact";
import APropos from "./pages/APropos";
import Abonnement from "./pages/Abonnement";
import NotFound from "./pages/NotFound";
import ProfilEnrichi from "./pages/ProfilEnrichi";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import Messagerie from "./pages/Messagerie";
import CompleteProfile from "./pages/CompleteProfile";
import { RequireProfileCompletion } from "./components/RequireProfileCompletion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    initAuthListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Router>
            <div className="relative">
              <Toaster />
              <Sonner />
              <Layout>
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/" element={<Index />} />
                  <Route path="/connexion" element={<Connexion />} />
                  <Route path="/inscription" element={<Inscription />} />
                  <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/a-propos" element={<APropos />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<ArticleDetail />} />

                  {/* Redirection de l'ancienne route vers la nouvelle */}
                  <Route path="/profil-stagiaire" element={<Navigate to="/stagiaires/:id" replace />} />

                  {/* Routes protégées nécessitant un profil complet */}
                  <Route
                    path="/stages"
                    element={
                      <RequireProfileCompletion>
                        <OffresStages />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route
                    path="/stages/:id"
                    element={
                      <RequireProfileCompletion>
                        <DetailStage />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route
                    path="/stagiaires/:id"
                    element={
                      <RequireProfileCompletion>
                        <ProfilStagiaire />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route
                    path="/entreprises/:id"
                    element={
                      <RequireProfileCompletion>
                        <ProfilEntreprise />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route
                    path="/messagerie"
                    element={
                      <RequireProfileCompletion>
                        <Messagerie />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route
                    path="/profil-enrichi"
                    element={
                      <RequireProfileCompletion>
                        <ProfilEnrichi />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route
                    path="/abonnement"
                    element={
                      <RequireProfileCompletion>
                        <Abonnement />
                      </RequireProfileCompletion>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </div>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
