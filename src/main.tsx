import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";

// Import all pages
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import OffresStages from "./pages/OffresStages";
import DetailStage from "./pages/DetailStage";
import Blog from "./pages/Blog";
import ArticleDetail from "./pages/ArticleDetail";
import APropos from "./pages/APropos";
import Contact from "./pages/Contact";
import Abonnement from "./pages/Abonnement";
import CompleteProfile from "./pages/CompleteProfile";
import ProfilStagiaire from "./pages/ProfilStagiaire";
import ProfilEntreprise from "./pages/ProfilEntreprise";
import ProfilEnrichi from "./pages/ProfilEnrichi";
import Settings from "./pages/Settings";
import Messagerie from "./pages/Messagerie";
import Admin from "./pages/Admin";
import EmailConfirmation from "./pages/EmailConfirmation";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";

// Create a router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "connexion",
        element: <Connexion />,
      },
      {
        path: "inscription",
        element: <Inscription />,
      },
      {
        path: "mot-de-passe-oublie",
        element: <MotDePasseOublie />,
      },
      {
        path: "stages",
        element: <OffresStages />,
      },
      {
        path: "stages/:id",
        element: <DetailStage />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "blog/:id",
        element: <ArticleDetail />,
      },
      {
        path: "a-propos",
        element: <APropos />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "abonnement",
        element: <Abonnement />,
      },
      {
        path: "complete-profile",
        element: <CompleteProfile />,
      },
      {
        path: "stagiaires/:id",
        element: <ProfilStagiaire />,
      },
      {
        path: "entreprises/:id",
        element: <ProfilEntreprise />,
      },
      {
        path: "profil-enrichi",
        element: <ProfilEnrichi />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "messagerie",
        element: <Messagerie />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
      {
        path: "email-confirmation",
        element: <EmailConfirmation />,
      },
      {
        path: "mentions-legales",
        element: <MentionsLegales />,
      },
      {
        path: "confidentialite",
        element: <Confidentialite />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="theme-preference">
      <RouterProvider router={router} />
      <Toaster />
      <SonnerToaster position="top-right" closeButton richColors />
    </ThemeProvider>
  </React.StrictMode>
);
