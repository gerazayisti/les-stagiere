
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contactez-nous</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Une question, une suggestion ou besoin d'aide ? Notre équipe est là
          pour vous répondre.
        </p>
        <Separator className="my-8" />
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Envoyez-nous un message</CardTitle>
            <CardDescription>
              Nous vous répondrons dans les plus brefs délais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nom complet
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Sujet
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Sujet de votre message"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Votre message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nos coordonnées</CardTitle>
              <CardDescription>
                Plusieurs façons de nous contacter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href="mailto:contact@stageconnect.fr"
                      className="text-primary hover:underline"
                    >
                      contact@stageconnect.fr
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Réponse sous 24-48h ouvrées
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Téléphone</h3>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href="tel:+33123456789"
                      className="text-primary hover:underline"
                    >
                      +33 1 23 45 67 89
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Du lundi au vendredi, 9h-18h
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Adresse</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Avenue de l'Innovation
                    <br />
                    75001 Paris, France
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Chat en direct</h3>
                  <p className="text-sm text-muted-foreground">
                    Disponible sur notre site web
                    <br />
                    Du lundi au vendredi, 10h-17h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Foire aux questions</CardTitle>
              <CardDescription>
                Retrouvez les réponses aux questions fréquentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Comment créer un compte ?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Comment publier une offre de stage ?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Comment postuler à un stage ?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Quels sont les tarifs pour les entreprises ?
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                  >
                    Voir toutes les FAQ
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
