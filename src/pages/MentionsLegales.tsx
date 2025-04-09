import React, { useEffect } from "react";

const MentionsLegales = () => {
  useEffect(() => {
    document.title = "Mentions Légales | Les Stagiaires";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Mentions Légales</h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Éditeur du site</h2>
          <p>
            Le site Les Stagiaires est édité par : ndzana Jerry et Gervais azanga représenté par TANGUH FOTSING Nelsonn, fondateur, 
            qui a nommé FOTSING GILLES TRESOR, Gérant de la société Les Stagiaires SARL.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Adresse : Happi - Yaoundé, Cameroun</li>
            <li>E-mail : lesstagiairescameroun@gmail.com</li>
            <li>Téléphone : 683 254 667 / 695 961 130 / 682 833 334</li>
            <li>Site web : <a href="https://lesstagiaires.com" className="text-primary hover:underline">https://lesstagiaires.com</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Hébergement</h2>
          <p>Le site est hébergé par : [Nom de l'hébergeur à compléter]</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Adresse : [Adresse de l'hébergeur]</li>
            <li>Site web : [Site de l'hébergeur]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Objet du site</h2>
          <p>
            Le site Les Stagiaires a pour vocation de favoriser la rencontre entre deux publics complémentaires : 
            d'une part, les élèves, étudiants, jeunes diplômés et toute personne en quête de stage académique, 
            professionnel ou d'emploi ; d'autre part, les entreprises désireuses de recruter, de trouver des stagiaires 
            ou de disposer de main-d'œuvre pour leurs campagnes publicitaires, marketing ou autres besoins ponctuels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Responsabilité</h2>
          <p>
            L'éditeur du site Les Stagiaires n'est pas responsable des informations renseignées ou publiées par les 
            utilisateurs sur la plateforme. Les entreprises partenaires ou les clients sont invités à vérifier l'exactitude 
            des informations fournies par les candidats avant tout partenariat ou engagement, notamment en sollicitant les 
            stagiaires pour des justificatifs ou entretiens. L'éditeur du site ne saurait être tenu pour responsable 
            d'éventuelles erreurs, omissions ou inexactitudes. Chaque utilisateur reste seul responsable de l'usage qu'il 
            fait du contenu et des services proposés sur le site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu du site (textes, images, graphismes, logos, vidéos, etc.) est protégé par les lois en 
            vigueur sur la propriété intellectuelle. Toute reproduction, représentation ou diffusion, totale ou partielle, 
            sans autorisation préalable de l'éditeur est strictement interdite.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MentionsLegales;
