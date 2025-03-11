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

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme-preference">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/inscription" />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/stagiaires/:id" element={<ProfilStagiaire />} />
          <Route path="/entreprises/:id" element={<ProfilEntreprise />} />
          <Route path="/profil-enrichi" element={<ProfilEnrichi />} />
          <Route path="/mes-candidatures" element={<MesCandidatures />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
