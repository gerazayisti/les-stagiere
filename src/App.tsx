
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import APropos from "./pages/APropos";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import Abonnement from "./pages/Abonnement";
import OffresStages from "./pages/OffresStages";
import DetailStage from "./pages/DetailStage";
import ProfilStagiaire from "./pages/ProfilStagiaire";
import ProfilEntreprise from "./pages/ProfilEntreprise";
import ProfilEnrichi from "./pages/ProfilEnrichi";
import Messagerie from "./pages/Messagerie";
import CompleteProfile from "./pages/CompleteProfile";
import { RequireProfileCompletion } from "./components/RequireProfileCompletion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import Admin from "./pages/Admin";
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Pages accessibles sans connexion */}
            <Route index element={<Index />} />
            <Route path="inscription" element={<Inscription />} />
            <Route path="connexion" element={<Connexion />} />
            <Route path="mot-de-passe-oublie" element={<MotDePasseOublie />} />
            <Route path="contact" element={<Contact />} />
            <Route path="a-propos" element={<APropos />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<ArticleDetail />} />
            <Route path="abonnement" element={<Abonnement />} />
            <Route path="stages" element={<OffresStages />} />
            <Route path="stages/:id" element={<DetailStage />} />
            <Route path="stagiaires/:id" element={<ProfilStagiaire />} />
            <Route path="entreprises/:id" element={<ProfilEntreprise />} />
            <Route path="profil-enrichi/:id" element={<ProfilEnrichi />} />
            <Route path="complete-profile" element={<CompleteProfile />} />
            
            {/* Pages qui nécessitent un profil complet */}
            <Route path="messagerie" element={
              <RequireProfileCompletion>
                <Messagerie />
              </RequireProfileCompletion>
            } />
            
            {/* Administration */}
            <Route path="admin" element={<Admin />} />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
        <SonnerToaster position="top-center" />
      </Router>
    </ThemeProvider>
  );
}

export default App;
