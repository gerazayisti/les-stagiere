import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import StagiaireProfile from "@/pages/StagiaireProfile";
import JobOfferDetails from "@/pages/JobOfferDetails";
import EntrepriseProfile from "@/pages/EntrepriseProfile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AuthContextProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <ThemeProvider defaultTheme="light" storageKey="theme-preference">
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/stagiaires/:id" element={<StagiaireProfile />} />
            <Route path="/stages/:id" element={<JobOfferDetails />} />
            <Route path="/entreprises/:id" element={<EntrepriseProfile />} />
            {/* Add other routes here as needed */}
          </Routes>
          <Footer />
          <Toaster position="top-center" />
        </ThemeProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
