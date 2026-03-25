import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record_type, record_id, content } = await req.json()
    
    // Vérification des paramètres
    if (!record_type || !record_id || !content) {
      throw new Error("Missing parameters: record_type, record_id, or content")
    }

    // Récupération des secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Le SERVICE_ROLE est nécessaire pour outrepasser les règles RLS et injecter l'embedding dans la db
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      throw new Error('Environment configuration incomplete')
    }

    console.log(`Generating embedding for ${record_type} ${record_id}...`)

    // 1. Générer l'embedding avec Gemini (text-embedding-004 génère 768 dimensions)
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    // Remplacer les champs vides ou null par un espace pour Gemini
    const cleanContent = content || "Profil générique";
    const result = await model.embedContent(cleanContent)
    const embedding = result.embedding.values
    
    console.log(`Embedding generated with ${embedding.length} dimensions. Saving to DB...`)

    // 2. Sauvegarder dans Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    let updateError;
    if (record_type === 'stage') {
       const { error } = await supabase.from('stages').update({ embedding }).eq('id', record_id)
       updateError = error
    } else if (record_type === 'stagiaire') {
       const { error } = await supabase.from('stagiaires').update({ embedding }).eq('id', record_id)
       updateError = error
    } else {
      throw new Error('Invalid record_type. Must be "stage" or "stagiaire".')
    }

    if (updateError) throw updateError

    console.log(`Success updating ${record_type} ${record_id}`)

    return new Response(
      JSON.stringify({ success: true, dimensions: embedding.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error generating embedding:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
