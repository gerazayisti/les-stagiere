import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour Vite
const supabaseUrl = 
  typeof window !== 'undefined' 
    ? (window as any).ENV?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL;

const supabaseAnonKey = 
  typeof window !== 'undefined' 
    ? (window as any).ENV?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY;

// Vérification de la configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Configuration Supabase incomplète. Vérifiez vos variables d\'environnement.');
}

// Créer le client Supabase de manière conditionnelle
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Interface pour les paramètres d'email
interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

// Fonction pour envoyer un email via Supabase
export const sendEmail = async ({ to, subject, body }: EmailParams) => {
  // Validation des paramètres d'entrée
  if (!to || !to.trim()) {
    console.warn('Adresse email destinataire manquante');
    return { success: false, error: 'Adresse email invalide' };
  }

  if (!supabase) {
    console.error('Client Supabase non initialisé');
    return { 
      success: false, 
      error: 'Configuration Supabase manquante' 
    };
  }

  try {
    // Vérifier la validité de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.warn(`Email invalide : ${to}`);
      return { success: false, error: 'Format email incorrect' };
    }

    // Insérer la notification avec des informations supplémentaires
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_email: to,
        subject: subject,
        message: body,
        type: 'candidature_status',
        created_at: new Date().toISOString(),
        status: 'pending', // Ajouter un statut initial
        retry_count: 0     // Compteur de tentatives
      })
      .select('*');

    if (error) {
      console.error('Erreur lors de l\'insertion de la notification', error);
      return { 
        success: false, 
        error: error.message || 'Échec de création de la notification' 
      };
    }

    // Vérifier que la notification a été créée
    if (!data || data.length === 0) {
      console.warn('Aucune notification créée');
      return { 
        success: false, 
        error: 'Création de notification échouée' 
      };
    }

    // Déclencher l'envoi du webhook de manière asynchrone
    sendWebhookNotification(data[0]).catch(webhookError => {
      console.error('Erreur lors de l\'envoi du webhook', webhookError);
    });

    return { 
      success: true, 
      notificationId: data[0].id 
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
};

// Fonction pour récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string) => {
  if (!supabase) {
    console.error('Client Supabase non initialisé');
    throw new Error('Configuration Supabase manquante');
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des notifications', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications', error);
    throw error;
  }
};

// Fonction pour marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string) => {
  if (!supabase) {
    console.error('Client Supabase non initialisé');
    throw new Error('Configuration Supabase manquante');
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la notification', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification', error);
    throw error;
  }
};

// Ajout de la fonction de webhook
export const setupWebhookNotification = async (userId: string, webhookUrl: string) => {
  if (!supabase) {
    console.error('Client Supabase non initialisé');
    throw new Error('Configuration Supabase manquante');
  }

  try {
    const { data, error } = await supabase
      .from('user_webhooks')
      .insert({
        user_id: userId,
        webhook_url: webhookUrl,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de la configuration du webhook', error);
      throw error;
    }

    return { success: true, message: 'Webhook configuré avec succès' };
  } catch (error) {
    console.error('Erreur lors de la configuration du webhook', error);
    throw error;
  }
};

// Fonction pour envoyer une notification via webhook
const sendWebhookNotification = async (notification: any) => {
  if (!supabase) {
    console.error('Client Supabase non initialisé');
    throw new Error('Configuration Supabase manquante');
  }

  try {
    // Récupérer les webhooks configurés pour l'utilisateur
    const { data: webhooks, error: webhookError } = await supabase
      .from('user_webhooks')
      .select('webhook_url')
      .eq('user_id', notification.recipient_id);

    if (webhookError) {
      console.error('Erreur de récupération des webhooks', webhookError);
      return;
    }

    // Envoyer la notification à chaque webhook configuré
    for (const webhook of webhooks) {
      try {
        await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notification)
        });
      } catch (webhookSendError) {
        console.error(`Erreur d'envoi au webhook ${webhook.webhook_url}`, webhookSendError);
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du webhook', error);
  }
};
