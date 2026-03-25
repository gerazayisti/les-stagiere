import { supabase } from '@/lib/supabase';

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
  console.log('Extracting skills from text via Edge Function:', text);
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'extractSkills', payload: { text } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    const skills = data.result.split(',').map((skill: string) => skill.trim());
    console.log('Extracted skills:', skills);
    return skills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    throw error;
  }
};

export const deduceEducationLevelFromText = async (text: string): Promise<string> => {
  console.log('Deducing education level from text via Edge Function:', text);
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'deduceEducationLevel', payload: { text } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    const educationLevel = data.result;
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
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'estimateCompensation', payload: { type, location } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    const compensationAmount = parseFloat(data.result);
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
  console.log('Analyzing CV against job description via Edge Function');
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'analyzeCV', payload: { cvText, jobDescription, requiredSkills } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    const analysisText = data.result;
    
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
  console.log('Analyzing motivation letter via Edge Function');
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'analyzeMotivationLetter', payload: { letterText, jobDescription } }
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    const analysisText = data.result;
    
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
