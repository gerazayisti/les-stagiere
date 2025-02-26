import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyRecommendations } from "@/components/profile/CompanyRecommendations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, Star, MapPin, Globe, Phone, Mail } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  location: string;
  website: string;
  phone: string;
  email: string;
  employeeCount: string;
  foundedYear: number;
}

export default function ProfilEntreprise() {
  // Simuler les données de l'entreprise (à remplacer par les vraies données)
  const company: CompanyData = {
    id: "1",
    name: "TechCorp Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    description: "Leader dans le développement de solutions technologiques innovantes",
    industry: "Technologies de l'information",
    location: "Yaoundé, Cameroun",
    website: "www.techcorp.com",
    phone: "+237 6XX XX XX XX",
    email: "contact@techcorp.com",
    employeeCount: "50-100",
    foundedYear: 2015,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête du profil */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={company.logo} />
            <AvatarFallback>{company.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
            <p className="text-muted-foreground">{company.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{company.employeeCount} employés</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Site web</p>
                        <a
                          href={`https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-muted-foreground">{company.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${company.email}`}
                          className="text-primary hover:underline"
                        >
                          {company.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Année de création</p>
                      <p className="text-muted-foreground">{company.foundedYear}</p>
                    </div>
                    <div>
                      <p className="font-medium">Taille de l'entreprise</p>
                      <p className="text-muted-foreground">
                        {company.employeeCount} employés
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <CompanyRecommendations
            companyId={company.id}
            companyName={company.name}
            companyLogo={company.logo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
