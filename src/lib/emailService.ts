import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour les emails
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface pour les paramètres d'email
interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

// Fonction pour envoyer un email via Supabase
export const sendEmail = async ({ to, subject, body }: EmailParams) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        recipient_email: to,
        subject: subject,
        message: body,
        type: 'candidature_status',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de l\'envoi de la notification', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email', error);
    throw error;
  }
};

// Fonction pour récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string) => {
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
