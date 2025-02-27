import { supabase } from './supabase'

export type UserRole = 'stagiaire' | 'entreprise'

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
        // Récupérer les données complètes de l'utilisateur
        const { data: userData, error } = await supabase.auth.admin.getUserById(
          payload.new.id
        )
        
        if (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error)
          return
        }

        await syncUserData(userData.user)
      }
    )
    .subscribe()
}

export const auth = {
  async signUp(data: SignUpData) {
    const { email, password, role, name } = data

    return withRetry(async () => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
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

      if (authError) throw authError
      return authData
    })
  },

  async signIn({ email, password }: SignInData) {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return data
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

  // Nouvelle fonction pour initialiser les données de test
  initializeTestData: async () => {
    try {
      // Créer un admin
      const adminEmail = 'admin@les-stagiaires.fr'
      const adminPassword = 'admin123'
      
      const { data: adminData, error: adminError } = await auth.signUp(
        adminEmail,
        adminPassword,
        'admin'
      )
      
      if (adminError) throw adminError

      // Créer une entreprise de test
      const entrepriseEmail = 'entreprise@test.fr'
      const entreprisePassword = 'test123'
      
      const { data: entrepriseData, error: entrepriseError } = await auth.signUp(
        entrepriseEmail,
        entreprisePassword,
        'entreprise'
      )
      
      if (entrepriseError) throw entrepriseError

      // Créer un stagiaire de test
      const stagiaireEmail = 'stagiaire@test.fr'
      const stagiairePassword = 'test123'
      
      const { data: stagiaireData, error: stagiaireError } = await auth.signUp(
        stagiaireEmail,
        stagiairePassword,
        'stagiaire'
      )
      
      if (stagiaireError) throw stagiaireError

      return { success: true, message: 'Données de test initialisées avec succès' }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de test:', error)
      return { success: false, message: 'Erreur lors de l\'initialisation des données' }
    }
  },
}
