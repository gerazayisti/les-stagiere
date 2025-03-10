import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import Home from "./pages/Home";
import ProfileStagiaire from "./pages/ProfileStagiaire";
import ProfileEntreprise from "./pages/ProfileEntreprise";
import Stages from "./pages/Stages";
import Entreprises from "./pages/Entreprises";
import Stagiaires from "./pages/Stagiaires";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import CompleteProfile from "./pages/CompleteProfile";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme-preference">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/stagiaires/:id" element={<ProfileStagiaire />} />
          <Route path="/entreprises/:id" element={<ProfileEntreprise />} />
          <Route path="/stages" element={<Stages />} />
          <Route path="/entreprises" element={<Entreprises />} />
          <Route path="/stagiaires" element={<Stagiaires />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
