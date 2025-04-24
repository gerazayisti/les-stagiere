import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Modèle standard pour les analyses simples
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Modèle plus avancé pour l'analyse de documents
const proModel = genAI.getGenerativeModel({ model: 'gemini-2.0-pro' });

export type StageType = 'temps_plein' | 'temps_partiel' | 'alternance' | 'remote';

export interface CVAnalysisResult {
  matchScore: number;          // Score global de correspondance (0-100)
  matchedSkills: string[];     // Compétences correspondantes
  missingSkills: string[];     // Compétences manquantes
  keyStrengths: string[];      // Points forts du candidat
  suggestions: string;         // Suggestions pour l'entretien
  educationMatch: boolean;     // Correspondance du niveau d'éducation
  experienceRelevance: number; // Pertinence de l'expérience (0-100)
  overallAssessment: string;   // Évaluation globale
}

export interface MotivationLetterAnalysisResult {
  clarity: number;             // Clarté de la lettre (0-100)
  relevance: number;           // Pertinence par rapport au poste (0-100)
  enthusiasm: number;          // Niveau d'enthousiasme (0-100)
  personalTouch: number;       // Personnalisation (0-100)
  grammar: number;             // Qualité grammaticale (0-100)
  overallScore: number;        // Score global (0-100)
  strengths: string[];         // Points forts de la lettre
  weaknesses: string[];        // Points faibles de la lettre
  summary: string;             // Résumé de l'analyse
}

export const extractSkillsFromText = async (text: string): Promise<string[]> => {
  console.log('Extracting skills from text:', text);
  try {
    const prompt = `Extrait les compétences techniques et non techniques mentionnées dans le texte suivant. Retourne uniquement une liste de compétences séparées par des virgules : ${text}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const skills = response.text().split(',').map(skill => skill.trim());
    console.log('Extracted skills:', skills);
    return skills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    throw error;
  }
};

export const deduceEducationLevelFromText = async (text: string): Promise<string> => {
  console.log('Deducing education level from text:', text);
  try {
    const prompt = `Déduis le niveau d'éducation requis à partir du texte suivant. Retourne uniquement le niveau d'éducation : ${text}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const educationLevel = response.text();
    console.log('Deduced education level:', educationLevel);
    return educationLevel;
  } catch (error) {
    console.error('Error deducing education level:', error);
    throw error;
  }
};

export const estimateCompensationAmount = async (type: StageType, location: string): Promise<number> => {
  console.log('Estimating compensation for:', type, location);
  try {
    const prompt = `Estime une compensation raisonnable pour un stage de type ${type} à ${location}. Retourne uniquement un montant numérique : ${type} ${location}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const compensationAmount = parseFloat(response.text());
    console.log('Estimated compensation:', compensationAmount);
    return compensationAmount;
  } catch (error) {
    console.error('Error estimating compensation:', error);
    throw error;
  }
};

/**
 * Analyse un CV par rapport à une offre de stage
 * @param cvText Le texte du CV
 * @param jobDescription La description du poste
 * @param requiredSkills Les compétences requises
 * @returns Une analyse détaillée du CV
 */
export const analyzeCV = async (
  cvText: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<CVAnalysisResult> => {
  console.log('Analyzing CV against job description');
  try {
    const prompt = `
    Analyse ce CV par rapport à cette description de poste et ces compétences requises.
    
    # CV
    ${cvText}
    
    # Description du poste
    ${jobDescription}
    
    # Compétences requises
    ${requiredSkills.join(', ')}
    
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
    `;

    const result = await proModel.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Extraire la partie JSON de la réponse
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }
    
    const analysis = JSON.parse(jsonMatch[0]) as CVAnalysisResult;
    return analysis;
  } catch (error) {
    console.error('Error analyzing CV:', error);
    // Retourner une analyse par défaut en cas d'erreur
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: requiredSkills,
      keyStrengths: [],
      suggestions: "Impossible d'analyser le CV. Vérifiez manuellement.",
      educationMatch: false,
      experienceRelevance: 0,
      overallAssessment: "L'analyse automatique n'a pas pu être effectuée."
    };
  }
};

/**
 * Analyse une lettre de motivation par rapport à une offre de stage
 * @param letterText Le texte de la lettre de motivation
 * @param jobDescription La description du poste
 * @returns Une analyse détaillée de la lettre de motivation
 */
export const analyzeMotivationLetter = async (
  letterText: string,
  jobDescription: string
): Promise<MotivationLetterAnalysisResult> => {
  console.log('Analyzing motivation letter');
  try {
    const prompt = `
    Analyse cette lettre de motivation par rapport à cette description de poste.
    
    # Lettre de motivation
    ${letterText}
    
    # Description du poste
    ${jobDescription}
    
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
    `;

    const result = await proModel.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // Extraire la partie JSON de la réponse
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }
    
    const analysis = JSON.parse(jsonMatch[0]) as MotivationLetterAnalysisResult;
    return analysis;
  } catch (error) {
    console.error('Error analyzing motivation letter:', error);
    // Retourner une analyse par défaut en cas d'erreur
    return {
      clarity: 0,
      relevance: 0,
      enthusiasm: 0,
      personalTouch: 0,
      grammar: 0,
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      summary: "L'analyse automatique n'a pas pu être effectuée."
    };
  }
};

/**
 * Extrait le texte d'un fichier PDF
 * @param pdfUrl L'URL du fichier PDF
 * @returns Le texte extrait du PDF
 */
export const extractTextFromPDF = async (pdfUrl: string): Promise<string> => {
  try {
    // Cette fonction simule l'extraction de texte d'un PDF
    // Dans une implémentation réelle, vous utiliseriez une bibliothèque comme pdf.js
    // ou un service d'extraction de texte
    
    // Simuler un délai pour l'extraction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retourner un message d'erreur pour l'instant
    return "Cette fonctionnalité d'extraction de texte à partir de PDF n'est pas encore implémentée. Veuillez utiliser une bibliothèque comme pdf.js ou un service d'extraction de texte.";
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};
