import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import SpeedInsights from "@vercel/speed-insights";
import { inject } from "@vercel/analytics";
import Layout from "@/components/Layout";

// Initialize analytics
inject();

// Pages
import Index from "./pages/Index";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import OffresStages from "./pages/OffresStages";
import DetailStage from "./pages/DetailStage";
import ProfilEntreprise from "./pages/ProfilEntreprise";
import ProfilStagiaire from "./pages/ProfilStagiaire";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import APropos from "./pages/APropos";
import Abonnement from "./pages/Abonnement";
import Blog from "./pages/Blog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/connexion" element={<Connexion />} />
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
                <Route path="/stages" element={<OffresStages />} />
                <Route path="/stages/:id" element={<DetailStage />} />
                <Route path="/entreprises/:id" element={<ProfilEntreprise />} />
                <Route path="/stagiaires/:id" element={<ProfilStagiaire />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/abonnement" element={<Abonnement />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
