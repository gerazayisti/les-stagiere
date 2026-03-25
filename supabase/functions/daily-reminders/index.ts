import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// Cette fonction est conçue pour être appelée périodiquement par pg_cron (Supabase Scheduled Functions)
// Exemple de configuration SQL: select cron.schedule('daily-reminders', '0 8 * * *', 'select net.http_post(''https://projet-id.supabase.co/functions/v1/daily-reminders'', ''{"Content-Type": "application/json"}''::jsonb, ''{}''::jsonb, ''{}''::jsonb);');

serve(async (req) => {
  try {
    // Vérification de sécurité optionnelle pour s'assurer que l'appel vient de l'interne ou a un cron_secret
    const authHeader = req.headers.get('Authorization');
    // if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not set');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Démarrage du job: Daily Reminders");

    // 1. Récupérer les candidatures en attente depuis plus de 3 jours
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: pendingApplications, error } = await supabase
      .from('candidatures')
      .select('id, stagiaire_id, stage_id, stages(entreprise_id, title)')
      .eq('status', 'en_attente')
      .lt('created_at', threeDaysAgo.toISOString());

    if (error) throw error;

    console.log(`Trouvé ${pendingApplications?.length || 0} candidatures en attente depuis +3 jours.`);

    // 2. Traiter les rappels (ici on simule l'envoi d'emails)
    // Dans un vrai projet, on appellerait Resend, SendGrid, ou le service d'emailing du projet
    let emailsSent = 0;
    
    // Groupement par entreprise
    const remindersByCompany: Record<string, any[]> = {};
    pendingApplications?.forEach(app => {
      const companyId = app.stages.entreprise_id;
      if (!remindersByCompany[companyId]) {
        remindersByCompany[companyId] = [];
      }
      remindersByCompany[companyId].push(app);
    });

    for (const [companyId, apps] of Object.entries(remindersByCompany)) {
      // Pour chaque entreprise avec des candidatures en attente, on "envoie" un email
      console.log(`Envoi automatique d'un rappel à l'entreprise ${companyId} pour ${apps.length} candidatures...`);
      // sendEmail(companyId, "Vous avez des candidatures en attente", "...");
      emailsSent++;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily reminders executed successfully',
        data: {
          pendingFound: pendingApplications?.length || 0,
          remindersSent: emailsSent
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error during daily-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
