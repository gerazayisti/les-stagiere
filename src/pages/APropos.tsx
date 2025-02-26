import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Target,
  Award,
  Rocket,
  CheckCircle,
  Building2,
  GraduationCap,
  Handshake,
} from "lucide-react";

export default function APropos() {
  const stats = [
    {
      value: "10K+",
      label: "Stagiaires",
      icon: Users,
    },
    {
      value: "500+",
      label: "Entreprises",
      icon: Building2,
    },
    {
      value: "2K+",
      label: "Stages",
      icon: GraduationCap,
    },
    {
      value: "95%",
      label: "Satisfaction",
      icon: CheckCircle,
    },
  ];

  const values = [
    {
      title: "Innovation",
      description:
        "Nous utilisons les dernières technologies pour connecter les talents aux meilleures opportunités.",
      icon: Rocket,
    },
    {
      title: "Excellence",
      description:
        "Nous nous engageons à fournir un service de haute qualité à nos utilisateurs.",
      icon: Award,
    },
    {
      title: "Impact",
      description:
        "Notre mission est de transformer positivement le parcours professionnel des étudiants.",
      icon: Target,
    },
    {
      title: "Collaboration",
      description:
        "Nous créons des partenariats durables entre entreprises et stagiaires.",
      icon: Handshake,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              À Propos de Les Stagiaires
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Nous construisons l'avenir de l'emploi en connectant les talents aux
              meilleures opportunités de stage.
            </p>
            <Button size="lg" variant="default">
              Rejoignez-nous
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_70%)] pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center bg-background/50 backdrop-blur">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
            <p className="text-muted-foreground">
              Faciliter l'accès aux stages et à l'emploi pour les étudiants tout en
              aidant les entreprises à trouver les meilleurs talents de demain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <value.icon className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre Équipe</h2>
            <p className="text-muted-foreground">
              Une équipe passionnée dédiée à votre réussite professionnelle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((member) => (
              <Card key={member}>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4" />
                  <CardTitle>Nom du Membre</CardTitle>
                  <CardDescription>Poste / Fonction</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  "Citation ou description du rôle du membre dans l'équipe"
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à Commencer Votre Carrière ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Rejoignez Les Stagiaires et découvrez les meilleures opportunités de
              stage.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="default">
                Chercher un Stage
              </Button>
              <Button size="lg" variant="outline">
                Publier une Offre
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
