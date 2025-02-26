import { useState } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé avec succès !");
    setFormData({ nom: "", email: "", sujet: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Contactez Notre Équipe
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Notre équipe d'experts est là pour vous accompagner dans votre recherche de stage
              et répondre à toutes vos questions.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="default">
                <Phone className="h-4 w-4 mr-2" />
                Appelez-nous
              </Button>
              <Button size="lg" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Écrivez-nous
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_70%)] pointer-events-none" />
      </section>

      {/* Main Content */}
      <section className="bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations de contact */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nos coordonnées</CardTitle>
                  <CardDescription>
                    Plusieurs moyens de nous contacter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>contact@les-stagiaires.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>123 Avenue des Stages, 75000 Paris</span>
                  </div>

                  <div className="pt-6">
                    <h3 className="font-medium text-lg mb-4">Suivez-nous</h3>
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-6 w-6" />
                      </a>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Facebook className="h-6 w-6" />
                      </a>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitter className="h-6 w-6" />
                      </a>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horaires d'ouverture</CardTitle>
                  <CardDescription>
                    Notre équipe est disponible aux horaires suivants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi</span>
                      <span>9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span>9h00 - 12h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span>Fermé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans
                  les plus brefs délais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom complet</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sujet">Sujet</Label>
                    <Input
                      id="sujet"
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleChange}
                      placeholder="Le sujet de votre message"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Votre message..."
                      className="h-32"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
