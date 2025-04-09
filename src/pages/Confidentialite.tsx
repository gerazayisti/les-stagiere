import React, { useEffect } from "react";

const Confidentialite = () => {
  useEffect(() => {
    document.title = "Politique de Confidentialité | Les Stagiaires";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Politique de Confidentialité</h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">1. Collecte des données personnelles</h2>
          <p>
            Le site Les Stagiaires collecte des données personnelles lors de l'inscription, de la création de profil, 
            du dépôt de candidatures ou de la publication d'offres de stage/emploi. Les données collectées peuvent inclure : 
            nom, prénom, adresse email, numéro de téléphone, parcours académique, CV, expériences professionnelles, 
            ainsi que toute autre information utile à la mise en relation entre candidats et entreprises.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">2. Finalité de la collecte</h2>
          <p>Les données sont utilisées pour :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>gérer les comptes utilisateurs (stagiaires et entreprises),</li>
            <li>faciliter la mise en relation entre candidats et recruteurs,</li>
            <li>envoyer des notifications ou communications relatives aux services du site,</li>
            <li>améliorer l'expérience utilisateur et proposer des offres adaptées.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">3. Partage et valorisation des données</h2>
          <p>
            Les informations communiquées par les utilisateurs, notamment les profils des stagiaires, peuvent être rendues 
            accessibles aux entreprises partenaires inscrites sur la plateforme, dans le strict cadre de leurs besoins en 
            recrutement, stages ou missions ponctuelles. Par ailleurs, Les Stagiaires se réserve la possibilité de valoriser 
            certaines données collectées — de manière encadrée, pseudonymisée et non intrusive — dans le cadre :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>d'analyses statistiques,</li>
            <li>d'études de marché,</li>
            <li>de campagnes de sondage,</li>
            <li>ou de collaborations stratégiques avec des partenaires tiers, dans le but d'optimiser les services proposés et d'assurer la viabilité économique de la plateforme.</li>
          </ul>
          <p className="mt-2">
            Dans certaines circonstances prévues par la loi, les données pourront également être transmises aux autorités compétentes. 
            L'utilisateur conserve à tout moment la possibilité d'exercer ses droits d'accès, de rectification, d'opposition ou de 
            suppression des données le concernant, conformément aux dispositions légales en vigueur, en adressant une requête à : 
            lesstagiairescameroun@gmail.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">4. Consentement et droits des utilisateurs</h2>
          <p>
            En s'inscrivant sur Les Stagiaires, les utilisateurs consentent à la collecte et au traitement de leurs données 
            conformément à cette politique. Chaque utilisateur dispose d'un droit d'accès, de rectification, de suppression 
            ou de limitation du traitement de ses données. Pour exercer ces droits, il suffit d'envoyer une demande à : 
            lesstagiairescameroun@gmail.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">5. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour garantir la confidentialité 
            des données personnelles, notamment le chiffrement et la restriction des accès.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">6. Durée de conservation</h2>
          <p>
            Les données sont conservées pendant toute la durée de l'utilisation des services, et jusqu'à 12 mois après la 
            désactivation du compte et l'envoi d'un mail à l'adresse lesstagiairescameroun@gmail.com, sauf obligation légale contraire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">7. Utilisation des cookies</h2>
          <p>Le site peut utiliser des cookies pour :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>analyser la navigation,</li>
            <li>faciliter l'identification de l'utilisateur,</li>
            <li>proposer du contenu personnalisé.</li>
          </ul>
          <p className="mt-2">Les utilisateurs peuvent configurer leur navigateur pour refuser ou supprimer les cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">8. Modification de la politique</h2>
          <p>
            Cette politique est susceptible d'évoluer. Les utilisateurs seront informés en cas de mise à jour importante. 
            La version en vigueur est toujours disponible sur le site.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Confidentialite;
