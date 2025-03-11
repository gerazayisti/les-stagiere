import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export type StageType = 'temps_plein' | 'temps_partiel' | 'alternance' | 'remote';

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
