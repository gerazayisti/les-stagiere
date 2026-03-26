import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable. Secret may not be set in Supabase.')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Utiliser gemini-1.5 pour une meilleure compatibilité et disponibilité
    console.log(`Action: ${action} - Using Gemini 1.5 Models`)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    
    let resultText = ''

    if (action === 'extractSkills') {
      const prompt = `Extrait les compétences techniques et non techniques mentionnées dans le texte suivant. Retourne uniquement une liste de compétences séparées par des virgules : ${payload.text}`
      const result = await model.generateContent(prompt)
      resultText = result.response.text()
    } else if (action === 'deduceEducationLevel') {
      const prompt = `Déduis le niveau d'éducation requis à partir du texte suivant. Retourne uniquement le niveau d'éducation : ${payload.text}`
      const result = await model.generateContent(prompt)
      resultText = result.response.text()
    } else if (action === 'estimateCompensation') {
      const prompt = `Estime une compensation raisonnable pour un stage de type ${payload.type} à ${payload.location}. Retourne uniquement un montant numérique : ${payload.type} ${payload.location}`
      const result = await model.generateContent(prompt)
      resultText = result.response.text()
    } else if (action === 'analyzeCV') {
      const prompt = `
      Analyse ce CV par rapport à cette description de poste et ces compétences requises.
      
      # CV
      ${payload.cvText}
      
      # Description du poste
      ${payload.jobDescription}
      
      # Compétences requises
      ${(payload.requiredSkills || []).join(', ')}
      
      Réponds au format JSON structuré comme suit :
      {
        "matchScore": (score global de correspondance de 0 à 100),
        "matchedSkills": [liste des compétences correspondantes],
        "missingSkills": [liste des compétences requises manquantes],
        "keyStrengths": [3-5 points forts du candidat],
        "suggestions": "suggestions pour l'entretien",
        "educationMatch": (true/false - le candidat a-t-il le niveau d'éducation requis),
        "experienceRelevance": (pertinence de l'expérience de 0 à 100),
        "overallAssessment": "évaluation globale en 2-3 phrases"
      }
      `
      const result = await proModel.generateContent(prompt)
      resultText = result.response.text()
    } else if (action === 'analyzeMotivationLetter') {
      const prompt = `
      Analyse cette lettre de motivation par rapport à cette description de poste.
      
      # Lettre de motivation
      ${payload.letterText}
      
      # Description du poste
      ${payload.jobDescription}
      
      Réponds au format JSON structuré comme suit :
      {
        "clarity": (clarté de la lettre de 0 à 100),
        "relevance": (pertinence par rapport au poste de 0 à 100),
        "enthusiasm": (niveau d'enthousiasme de 0 à 100),
        "personalTouch": (personnalisation de 0 à 100),
        "grammar": (qualité grammaticale de 0 à 100),
        "overallScore": (score global de 0 à 100),
        "strengths": [3-5 points forts de la lettre],
        "weaknesses": [3-5 points faibles de la lettre],
        "summary": "résumé de l'analyse en 2-3 phrases"
      }
      `
      const result = await proModel.generateContent(prompt)
      resultText = result.response.text()
    } else {
      throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ result: resultText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
