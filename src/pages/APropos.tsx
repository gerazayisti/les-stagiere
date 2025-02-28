
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { TargetAudience } from "@/components/TargetAudience";

export default function APropos() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">À propos de StageConnect</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Nous connectons les étudiants talentueux avec les entreprises qui
          cherchent à innover et à grandir.
        </p>
        <Separator className="my-8" />
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
          <p className="text-lg mb-4">
            StageConnect est né d'une simple observation : le processus de
            recherche de stage est souvent fastidieux, tant pour les étudiants
            que pour les entreprises. Notre mission est de simplifier cette
            expérience en créant une plateforme qui valorise le potentiel de
            chacun.
          </p>
          <p className="text-lg mb-4">
            Nous croyons que chaque étudiant mérite de trouver un stage qui lui
            permettra de développer ses compétences et de lancer sa carrière.
            Parallèlement, nous aidons les entreprises à découvrir des talents
            prometteurs qui apporteront une nouvelle perspective à leurs équipes.
          </p>
          <Button size="lg" className="mt-4">
            Découvrir nos services
          </Button>
        </div>
        <div className="relative">
          <img
            src="/hero1.webp"
            alt="L'équipe StageConnect en réunion"
            className="rounded-lg shadow-xl"
          />
          <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
            <p className="font-bold">+5000</p>
            <p className="text-sm">Stages pourvus</p>
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Nos Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <ServiceCard
            title="Pour les Étudiants"
            description="Accédez à des milliers d'offres de stages, créez un profil professionnel attractif et recevez des recommandations personnalisées."
            icon="User"
          />
          <ServiceCard
            title="Pour les Entreprises"
            description="Publiez vos offres de stages, découvrez des candidats qualifiés et gérez tout le processus de recrutement en un seul endroit."
            icon="Building"
          />
          <ServiceCard
            title="Accompagnement"
            description="Bénéficiez de conseils personnalisés, d'ateliers de préparation et d'outils d'aide à la décision pour faire les meilleurs choix."
            icon="HeartHandshake"
          />
        </div>
      </section>

      <Separator className="my-12" />

      <section>
        <h2 className="text-3xl font-bold text-center mb-8">
          Pour Qui Est StageConnect?
        </h2>
        <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Notre plateforme s'adresse à tous ceux qui cherchent à transformer
          l'expérience du stage en une opportunité enrichissante.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <TargetAudience
            title="Étudiants"
            items={[
              "Étudiants en formation initiale",
              "Personnes en reconversion professionnelle",
              "Jeunes diplômés à la recherche d'une première expérience",
              "Étudiants internationaux cherchant des stages en France",
            ]}
          />
          <TargetAudience
            title="Entreprises"
            items={[
              "Startups en pleine croissance",
              "PME cherchant à innover",
              "Grandes entreprises avec des programmes de stages établis",
              "Organisations à but non lucratif et institutions publiques",
            ]}
          />
        </div>
      </section>

      <Separator className="my-12" />

      <section className="bg-muted p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8">Notre Histoire</h2>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-4">
            StageConnect a été fondé en 2020 par une équipe d'anciens étudiants
            qui ont eux-mêmes vécu les défis de la recherche de stage. Frustrés
            par le manque d'outils adaptés, ils ont décidé de créer la
            plateforme qu'ils auraient aimé avoir pendant leurs études.
          </p>
          <p className="text-lg mb-4">
            Ce qui a commencé comme un petit projet est rapidement devenu une
            plateforme nationale, connectant des milliers d'étudiants à des
            entreprises innovantes chaque année. Aujourd'hui, StageConnect
            continue d'évoluer en intégrant de nouvelles technologies et en
            répondant aux besoins changeants du marché du travail.
          </p>
          <p className="text-lg">
            Notre équipe s'est agrandie, mais notre mission reste la même :
            rendre la recherche de stage plus simple, plus juste et plus
            enrichissante pour tous.
          </p>
        </div>
      </section>

      <Separator className="my-12" />

      <section className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Rejoignez-nous</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Que vous soyez étudiant à la recherche d'un stage ou une entreprise
          cherchant à recruter, StageConnect est là pour vous aider à réussir.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="default">
            S'inscrire gratuitement
          </Button>
          <Button size="lg" variant="outline">
            En savoir plus
          </Button>
        </div>
      </section>
    </div>
  );
}
