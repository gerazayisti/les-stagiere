
import { supabase } from './supabase'

export type UserRole = 'stagiaire' | 'entreprise' | 'admin'

interface SignUpData {
  email: string
  password: string
  role: UserRole
  name: string
}

interface SignInData {
  email: string
  password: string
}

// Configuration pour la gestion des retries
const RETRY_CONFIG = {
  maxRetries: 4,
  initialDelay: 10000,
  maxDelay: 30000,
  backoffFactor: 2
}

// Fonction utilitaire pour gérer les retries avec exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    if (
      retryCount >= RETRY_CONFIG.maxRetries ||
      error.status !== 429
    ) {
      throw error
    }

    const delay = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffFactor, retryCount),
      RETRY_CONFIG.maxDelay
    )

    await new Promise(resolve => setTimeout(resolve, delay))
    console.log(`Tentative ${retryCount + 1}/${RETRY_CONFIG.maxRetries}...`)
    return withRetry(operation, retryCount + 1)
  }
}

// Fonction pour synchroniser un utilisateur avec les tables public
const syncUserData = async (authUser: any) => {
  try {
    if (!authUser) return;

    // Insérer/mettre à jour dans la table users
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        role: authUser.user_metadata?.role || 'stagiaire',
        email_verified: authUser.email_confirmed_at ? true : false,
        is_active: true,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (userError) throw userError

    // Si c'est un stagiaire, synchroniser avec la table stagiaires
    if (authUser.user_metadata?.role === 'stagiaire') {
      const { error: stagiaireError } = await supabase
        .from('stagiaires')
        .upsert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          email: authUser.email,
          avatar_url: authUser.user_metadata?.avatar_url,
          skills: [],
          languages: [],
          preferred_locations: [],
          preferred_domains: [],
          last_active: new Date().toISOString(),
        })

      if (stagiaireError) throw stagiaireError
    }

    // Si c'est une entreprise, synchroniser avec la table entreprises
    if (authUser.user_metadata?.role === 'entreprise') {
      const { error: entrepriseError } = await supabase
        .from('entreprises')
        .upsert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          email: authUser.email,
          logo_url: authUser.user_metadata?.avatar_url,
          industry: authUser.user_metadata?.industry || '',
          location: authUser.user_metadata?.location || '',
          benefits: [],
        })

      if (entrepriseError) throw entrepriseError
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation des données:', error)
  }
}

// Initialiser l'écoute des changements auth
export const initAuthListener = () => {
  // Écouter les changements de session
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      await syncUserData(session?.user)
    }
  })

  // Écouter les changements dans auth.users via realtime
  supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'auth',
        table: 'users',
      },
      async (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
          const { data: userData, error } = await supabase.auth.admin.getUserById(
            payload.new.id as string
          )
          
          if (error) {
            console.error('Erreur lors de la récupération des données utilisateur:', error)
            return
          }

          await syncUserData(userData.user)
        }
      }
    )
    .subscribe()
}

// Fonction pour télécharger et supprimer un avatar
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const deleteAvatar = async (url: string): Promise<void> => {
  const path = url.split('/').pop();
  if (!path) return;
  
  const { error } = await supabase.storage
    .from('public')
    .remove([`avatars/${path}`]);

  if (error) throw error;
};

export const auth = {
  async signUp(data: SignUpData) {
    const { email, password, role, name } = data

    return withRetry(async () => {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          },
        },
      })

      if (result.error) throw result.error
      return result
    })
  },

  async signIn({ email, password }: SignInData) {
    return withRetry(async () => {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (result.error) throw result.error
      return result.data
    })
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (!session) return null

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      
      return user
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  },

  // Fonction pour mettre à jour le profil utilisateur
  async updateProfile(userData: any) {
    const { data: authData, error: updateError } = await supabase.auth.updateUser({
      data: userData
    })

    if (updateError) throw updateError

    // La synchronisation sera gérée par le listener
    return authData
  },

  // Nouvelles fonctions ajoutées pour les opérations sur les avatars
  uploadAvatar,
  deleteAvatar,

  // Nouvelle fonction pour initialiser les données de test
  initializeTestData: async () => {
    try {
      // Créer un admin
      const adminEmail = 'admin@les-stagiaires.fr'
      const adminPassword = 'admin123'
      
      const adminSignUp = await auth.signUp({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        name: 'Admin'
      })
      
      // Créer une entreprise de test
      const entrepriseEmail = 'entreprise@test.fr'
      const entreprisePassword = 'test123'
      
      const entrepriseSignUp = await auth.signUp({
        email: entrepriseEmail,
        password: entreprisePassword,
        role: 'entreprise',
        name: 'Entreprise Test'
      })
      
      // Créer un stagiaire de test
      const stagiaireEmail = 'stagiaire@test.fr'
      const stagiairePassword = 'test123'
      
      const stagiaireSignUp = await auth.signUp({
        email: stagiaireEmail,
        password: stagiairePassword,
        role: 'stagiaire',
        name: 'Stagiaire Test'
      })

      return { success: true, message: 'Données de test initialisées avec succès' }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de test:', error)
      return { success: false, message: 'Erreur lors de l\'initialisation des données' }
    }
  },
}
