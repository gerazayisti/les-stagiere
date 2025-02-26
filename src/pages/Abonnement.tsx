import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Pricing } from "@/components/Pricing";
import { TargetAudience } from "@/components/TargetAudience";

export default function Abonnement() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
          Choisissez votre plan
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Trouvez le plan parfait pour votre entreprise. Que vous soyez une startup ou une grande entreprise,
          nous avons la solution adaptée à vos besoins.
        </p>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* Target Audience Section */}
      <section className="mt-24">
        <TargetAudience />
      </section>

      {/* CTA Section */}
      <section className="text-center mt-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Prêt à commencer ?
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'entreprises qui font confiance à notre plateforme pour trouver les meilleurs stagiaires.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" variant="default">
            Commencer gratuitement
          </Button>
          <Button size="lg" variant="outline">
            Nous contacter
          </Button>
        </div>
      </section>
    </div>
  );
}
