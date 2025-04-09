import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import { Navigate } from "react-router-dom";
import ProfilStagiaire from "./pages/ProfilStagiaire";
import ProfilEntreprise from "./pages/ProfilEntreprise";
import ProfilEnrichi from "./pages/ProfilEnrichi";
import MesCandidatures from "./pages/MesCandidatures";
import NotFound from "./pages/NotFound";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import Layout from "./components/Layout";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme-preference">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/inscription" />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/stagiaires/:id" element={<ProfilStagiaire />} />
            <Route path="/entreprises/:id" element={<ProfilEntreprise />} />
            <Route path="/profil-enrichi" element={<ProfilEnrichi />} />
            <Route path="/mes-candidatures" element={<MesCandidatures />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
