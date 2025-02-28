
import { supabase } from './supabase';
import { auth } from './auth';
import { toast } from 'sonner';

/**
 * Cette fonction réinitialise la base de données et crée des données de test
 * Utile pour le développement ou les démos
 */
export async function resetDatabase() {
  try {
    console.log("Début de la réinitialisation de la base de données...");
    
    // 1. Vider les tables principales (l'ordre est important pour respecter les contraintes de clés étrangères)
    const tablesToEmpty = [
      'messages',
      'conversations',
      'candidatures',
      'recommendations',
      'stages',
      'projects',
      'documents',
      'experiences',
      'certifications',
      'stagiaire_skills',
      'entreprises',
      'stagiaires',
      'users'
    ];
    
    for (const table of tablesToEmpty) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.error(`Erreur lors de la suppression des données de ${table}:`, error);
        // Continuer même en cas d'erreur sur une table
      } else {
        console.log(`Table ${table} vidée avec succès`);
      }
    }
    
    // 2. Déconnecter l'utilisateur actuel si connecté
    await auth.signOut();
    console.log("Utilisateur déconnecté");
    
    // 3. Créer des utilisateurs de test
    const testUsers = await createTestUsers();
    console.log("Utilisateurs de test créés:", testUsers);
    
    // 4. Création de données factices pour les démonstrations
    await createTestData(testUsers);
    console.log("Données de test créées");
    
    toast.success("Base de données réinitialisée avec succès", {
      description: "Des utilisateurs et données de test ont été créés",
      duration: 5000
    });
    
    return { success: true, message: "Base de données réinitialisée avec succès", users: testUsers };
  } catch (error) {
    console.error("Erreur lors de la réinitialisation de la base de données:", error);
    toast.error("Erreur lors de la réinitialisation", {
      description: "Une erreur est survenue lors de la réinitialisation de la base de données",
      duration: 5000
    });
    return { success: false, message: "Erreur lors de la réinitialisation de la base de données" };
  }
}

async function createTestUsers() {
  const users = {
    admin: null,
    entreprise: null,
    stagiaire: null
  };
  
  try {
    // Création de l'admin
    const adminEmail = 'admin@les-stagiaires.fr';
    const adminPassword = 'admin123';
    const { data: adminData } = await auth.signUp({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      name: 'Admin Système'
    });
    users.admin = adminData;
    
    // Création de l'entreprise
    const entrepriseEmail = 'entreprise@test.fr';
    const entreprisePassword = 'test123';
    const { data: entrepriseData } = await auth.signUp({
      email: entrepriseEmail,
      password: entreprisePassword,
      role: 'entreprise',
      name: 'Entreprise Test'
    });
    users.entreprise = entrepriseData;
    
    // Création du stagiaire
    const stagiaireEmail = 'stagiaire@test.fr';
    const stagiairePassword = 'test123';
    const { data: stagiaireData } = await auth.signUp({
      email: stagiaireEmail,
      password: stagiairePassword,
      role: 'stagiaire',
      name: 'Stagiaire Test'
    });
    users.stagiaire = stagiaireData;
    
    return users;
  } catch (error) {
    console.error("Erreur lors de la création des utilisateurs de test:", error);
    throw error;
  }
}

async function createTestData(users: any) {
  try {
    if (!users.entreprise || !users.stagiaire) {
      throw new Error("Utilisateurs de test manquants");
    }
    
    const entrepriseId = users.entreprise.user.id;
    const stagiaireId = users.stagiaire.user.id;
    
    // Mise à jour du profil entreprise
    await supabase.from('entreprises').update({
      description: "Nous sommes une entreprise innovante spécialisée dans le développement de solutions digitales.",
      industry: "Technologie",
      size: "50-100 employés",
      location: "Paris, France",
      website: "https://entreprise-test.fr",
      phone: "+33123456789"
    }).eq('id', entrepriseId);
    
    // Mise à jour du profil stagiaire
    await supabase.from('stagiaires').update({
      title: "Étudiant en informatique",
      bio: "Passionné par le développement web et les nouvelles technologies.",
      location: "Lyon, France",
      education: "Master en Informatique",
      disponibility: "Disponible dès maintenant",
      skills: ["JavaScript", "React", "Node.js"],
      languages: ["Français", "Anglais"],
      preferred_locations: ["Paris", "Lyon", "Remote"],
      is_premium: true
    }).eq('id', stagiaireId);
    
    // Création d'offres de stage
    const stagesData = [
      {
        entreprise_id: entrepriseId,
        title: "Développeur Frontend React",
        description: "Stage pour développeur frontend maîtrisant React et TypeScript",
        short_description: "Rejoignez notre équipe pour développer des interfaces utilisateur modernes",
        requirements: "Connaissance de React, TypeScript et des principes de design responsive",
        responsibilities: "Développement d'interfaces, tests, collaboration avec l'équipe backend",
        location: "Paris",
        remote_policy: "Hybride",
        type: "temps_plein",
        duration: "6 mois",
        start_date: new Date(2023, 5, 1).toISOString(),
        compensation: JSON.stringify({ amount: 1000, currency: "EUR", period: "month" }),
        required_skills: ["React", "TypeScript", "HTML/CSS"],
        preferred_skills: ["Redux", "Testing Library", "Figma"],
        education_level: "Bac+4/5",
        status: "active",
        created_at: new Date().toISOString(),
        is_featured: true
      },
      {
        entreprise_id: entrepriseId,
        title: "Stagiaire Data Analyst",
        description: "Stage en analyse de données pour étudiant en statistiques ou data science",
        short_description: "Analysez nos données pour en extraire des insights business",
        requirements: "Connaissance de Python, SQL et des concepts de data science",
        responsibilities: "Analyse de données, création de dashboards, présentation des résultats",
        location: "Lyon",
        remote_policy: "100% sur site",
        type: "temps_plein",
        duration: "4 mois",
        start_date: new Date(2023, 6, 1).toISOString(),
        compensation: JSON.stringify({ amount: 800, currency: "EUR", period: "month" }),
        required_skills: ["Python", "SQL", "Statistiques"],
        preferred_skills: ["Tableau", "Power BI", "R"],
        education_level: "Bac+3/4",
        status: "active",
        created_at: new Date().toISOString()
      }
    ];
    
    const { data: stagesInserted, error: stagesError } = await supabase
      .from('stages')
      .insert(stagesData)
      .select();
      
    if (stagesError) throw stagesError;
    
    // Création d'une candidature
    if (stagesInserted && stagesInserted.length > 0) {
      const stageId = stagesInserted[0].id;
      
      await supabase.from('candidatures').insert({
        stage_id: stageId,
        stagiaire_id: stagiaireId,
        status: 'en_attente',
        date_postulation: new Date().toISOString()
      });
    }
    
    // Création d'une recommandation
    await supabase.from('recommendations').insert({
      entreprise_id: entrepriseId,
      stagiaire_id: stagiaireId,
      position: "Développeur Frontend",
      department: "IT",
      period: "Janvier - Juin 2023",
      start_date: new Date(2023, 0, 1).toISOString(),
      end_date: new Date(2023, 5, 30).toISOString(),
      rating: 5,
      content: "Excellent stagiaire, très impliqué et compétent. A su s'intégrer rapidement dans l'équipe et proposer des solutions innovantes.",
      skills: ["React", "TypeScript", "API REST"],
      achievements: ["Développement d'une nouvelle interface utilisateur", "Réduction de 30% du temps de chargement"],
      is_public: true
    });
    
    // Création d'un projet pour le stagiaire
    await supabase.from('projects').insert({
      stagiaire_id: stagiaireId,
      title: "Application de gestion de tâches",
      description: "Développement d'une application web de gestion de tâches avec React et Firebase",
      technologies: ["React", "Firebase", "Material-UI"],
      image_url: "https://via.placeholder.com/500",
      github_url: "https://github.com/stagiaire/taskmanager",
      status: "completed"
    });
    
  } catch (error) {
    console.error("Erreur lors de la création des données de test:", error);
    throw error;
  }
}
