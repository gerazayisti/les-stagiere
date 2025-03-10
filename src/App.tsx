import { useState, useEffect } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from "@/components/ui/theme-provider"
import Index from "@/pages/Index"
import APropos from "@/pages/APropos"
import Contact from "@/pages/Contact"
import OffresStages from "@/pages/OffresStages"
import DetailStage from "@/pages/DetailStage"
import Abonnement from "@/pages/Abonnement"
import Blog from "@/pages/Blog"
import ArticleDetail from "@/pages/ArticleDetail"
import Inscription from "@/pages/Inscription"
import Connexion from "@/pages/Connexion"
import MotDePasseOublie from "@/pages/MotDePasseOublie"
import CompleteProfile from "@/pages/CompleteProfile"
import Settings from "@/pages/Settings"
import ProfilEnrichi from "@/pages/ProfilEnrichi"
import Messagerie from "@/pages/Messagerie"
import ProfilStagiaire from "@/pages/ProfilStagiaire"
import ProfilEntreprise from "@/pages/ProfilEntreprise"
import Admin from "@/pages/Admin"
import NotFound from "@/pages/NotFound"
import { useAuth } from "@/hooks/useAuth"
import { Toaster } from "@/components/ui/toaster"
import EmailConfirmation from "@/pages/EmailConfirmation"

function App() {
  const [isMounted, setIsMounted] = useState(false)
  const { loading } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <BrowserRouter>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <p>Chargement...</p>
          </div>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/a-propos" element={<APropos />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/stages" element={<OffresStages />} />
              <Route path="/stages/:id" element={<DetailStage />} />
              <Route path="/abonnement" element={<Abonnement />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<ArticleDetail />} />
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profil" element={<ProfilEnrichi />} />
              <Route path="/messagerie" element={<Messagerie />} />
              <Route path="/messagerie/:id" element={<Messagerie />} />
              <Route path="/stagiaires/:id" element={<ProfilStagiaire />} />
              <Route path="/entreprises/:id" element={<ProfilEntreprise />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
