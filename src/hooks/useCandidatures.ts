import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { analyzeCV, analyzeMotivationLetter, extractTextFromPDF, CVAnalysisResult, MotivationLetterAnalysisResult } from '@/lib/aiHelpers';

export interface Candidature {
  id?: string;
  stage_id: string;
  stagiaire_id: string;
  cv_id?: string | null;
  lettre_motivation_id?: string | null;
  status: 'en_attente' | 'acceptee' | 'refusee' | 'en_discussion';
  note?: string | null;
  internal_rating?: number | null;
  interview_date?: string | null;
  interview_feedback?: string | null;
  date_postulation?: string;
  last_interaction?: string | null;
  status_change_reason?: string | null;
  status_changed_by?: 'entreprise' | 'stagiaire' | null;
  
  // Relations optionnelles
  stages?: {
    id: string;
    title: string;
    description: string;
    entreprises?: {
      id: string;
      name: string;
      logo_url?: string;
    };
    required_skills?: string[];
  };
  
  stagiaires?: {
    id: string;
    name: string;
    email: string;
    skills?: string[];
    cv_url?: string;
  };
}

export interface CandidatureInput {
  stage_id: string;
  stagiaire_id: string;
  cv?: File | string | null;
  lettre_motivation?: File | string | null;
  status?: 'en_attente' | 'acceptee' | 'refusee' | 'en_discussion';
  use_existing_documents?: boolean;
}

export interface CompetenceAnalysis {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
}

export const useCandidatures = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifie si un document existe déjà pour un stagiaire
  const getExistingDocument = async (stagiaireId: string, type: 'cv' | 'lettre_motivation') => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, file_url')
        .eq('stagiaire_id', stagiaireId)
        .eq('type', type === 'cv' ? 'CV' : 'Lettre de motivation')
        .eq('is_primary', true)
        .order('upload_date', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error(`Erreur lors de la récupération du document ${type}:`, err);
      return null;
    }
  };

  const uploadDocument = async (file: File | string | null, stagiaireId: string, type: 'cv' | 'lettre_motivation') => {
    // Si file est null, essayer de récupérer un document existant
    if (!file) {
      const existingDoc = await getExistingDocument(stagiaireId, type);
      return existingDoc?.id || null;
    }

    // Si file est une chaîne, c'est un ID de document existant à réutiliser
    if (typeof file === 'string') {
      return file;
    }

    try {
      // Vérifier que le fichier n'est pas trop volumineux (10 Mo max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Le fichier est trop volumineux (max 10 Mo)`);
        return null;
      }

      // Nettoyer l'ID du stagiaire pour éviter les caractères spéciaux dans le chemin
      const safeId = stagiaireId.replace(/[^a-zA-Z0-9]/g, '');
      
      // Extraire et nettoyer l'extension du fichier
      const fileNameParts = file.name.split('.');
      const fileExt = fileNameParts.pop() || 'docx';
      
      // Créer un nom de fichier sécurisé
      const timestamp = Date.now();
      const fileName = `${safeId}_${type}_${timestamp}.${fileExt}`;
      
      // Utiliser un chemin simple sans sous-dossiers pour éviter les problèmes de permissions
      const filePath = fileName;

      console.log(`Tentative d'upload du fichier ${type}:`, {
        bucket: 'cvdocuments',
        path: filePath,
        size: file.size,
        type: file.type
      });

      // Upload file to Supabase storage avec plus d'options
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('cvdocuments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Remplacer si existe déjà
          contentType: file.type // Spécifier explicitement le type MIME
        });

      if (uploadError) {
        console.error(`Erreur d'upload Supabase:`, uploadError);
        throw uploadError;
      }

      console.log(`Fichier uploadé avec succès:`, uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cvdocuments')
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique du document");
      }

      console.log(`URL publique obtenue:`, urlData.publicUrl);

      // Save document metadata to database
      const documentMetadata = {
        stagiaire_id: stagiaireId,
        type: type === 'cv' ? 'CV' : 'Lettre de motivation',
        name: fileName,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
        is_primary: true
      };

      console.log(`Enregistrement des métadonnées:`, documentMetadata);

      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert(documentMetadata)
        .select()
        .single();

      if (documentError) {
        console.error(`Erreur d'insertion dans la base de données:`, documentError);
        throw documentError;
      }

      console.log(`Document enregistré avec succès:`, documentData);
      return documentData.id;
    } catch (err: any) {
      console.error(`Erreur lors de l'upload du ${type}:`, err);
      
      // Afficher des détails plus précis sur l'erreur
      if (err.message) console.error(`Message d'erreur:`, err.message);
      if (err.details) console.error(`Détails:`, err.details);
      if (err.hint) console.error(`Indice:`, err.hint);
      if (err.code) console.error(`Code d'erreur:`, err.code);
      
      toast.error(`Impossible de télécharger le ${type}: ${err.message || 'Erreur inconnue'}`);
      return null;
    }
  };

  const createCandidature = async ({ 
    stage_id, 
    stagiaire_id, 
    cv, 
    lettre_motivation, 
    status = 'en_attente',
    use_existing_documents = false
  }: CandidatureInput) => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si une candidature existe déjà
      const { data: existingCandidature, error: checkError } = await supabase
        .from('candidatures')
        .select('*')
        .eq('stage_id', stage_id)
        .eq('stagiaire_id', stagiaire_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCandidature) {
        toast.warning('Vous avez déjà postulé à ce stage');
        return null;
      }

      // Upload des documents
      const cv_id = cv ? await uploadDocument(cv, stagiaire_id, 'cv') : null;
      const lettre_motivation_id = lettre_motivation 
        ? await uploadDocument(lettre_motivation, stagiaire_id, 'lettre_motivation') 
        : null;

      // Création de la candidature
      const { data, error } = await supabase
        .from('candidatures')
        .insert({
          stage_id,
          stagiaire_id,
          cv_id,
          lettre_motivation_id,
          status,
          last_interaction: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Candidature envoyée avec succès');
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la candidature');
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCandidaturesByUser = async (stagiaireId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidatures')
        .select(`
          *,
          stages (
            title,
            description,
            entreprises (name, logo_url)
          )
        `)
        .eq('stagiaire_id', stagiaireId)
        .order('date_postulation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des candidatures');
      toast.error(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCandidaturesByEntreprise = async (entrepriseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stages')
        .select(`
          id,
          title,
          description,
          required_skills,
          location,
          type,
          compensation,
          education_level,
          candidatures (
            id,
            stagiaire_id,
            stage_id,
            status,
            date_postulation,
            cv_id,
            lettre_motivation_id,
            cv:documents!candidatures_cv_id_fkey (id, file_url),
            lettre:documents!candidatures_lettre_motivation_id_fkey (id, file_url),
            note,
            internal_rating,
            stagiaires (
              id,
              name,
              email,
              skills,
              education,
              bio
            )
          )
        `)
        .eq('entreprise_id', entrepriseId);

      if (error) throw error;
      
      // Vérifier que les URLs des documents sont bien présentes
      const stagesWithCandidatures = data || [];
      
      // Log pour débogage
      console.log("Stages avec candidatures récupérés:", JSON.stringify(stagesWithCandidatures, null, 2));
      
      return stagesWithCandidatures;
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      setError(err.message || 'Erreur lors de la récupération des candidatures');
      toast.error(err.message || 'Erreur lors de la récupération des candidatures');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateCandidatureStatus = async (
    candidatureId: string, 
    status: Candidature['status'], 
    additionalData?: {
      note?: string;
      internal_rating?: number;
      interview_date?: string;
      interview_feedback?: string;
      status_change_reason?: string;
      status_changed_by?: 'entreprise' | 'stagiaire';
    }
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidatures')
        .update({
          status,
          last_interaction: new Date().toISOString(),
          status_change_reason: additionalData?.status_change_reason || null,
          status_changed_by: additionalData?.status_changed_by || 'entreprise',
          ...additionalData
        })
        .eq('id', candidatureId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Statut de candidature mis à jour');
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du statut');
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyseCompetences = (stageSkills: string[], stagiaireSkills: string[]): CompetenceAnalysis => {
    if (!stageSkills || !stagiaireSkills) {
      return {
        match_percentage: 0,
        matched_skills: [],
        missing_skills: stageSkills || []
      };
    }

    const matchedSkills = stageSkills.filter(skill => 
      stagiaireSkills.some(cvSkill => 
        cvSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    const missingSkills = stageSkills.filter(skill => 
      !matchedSkills.includes(skill)
    );

    const matchPercentage = stageSkills.length > 0 
      ? Math.round((matchedSkills.length / stageSkills.length) * 100)
      : 0;

    return {
      match_percentage: matchPercentage,
      matched_skills: matchedSkills,
      missing_skills: missingSkills
    };
  };

  /**
   * Récupère le contenu d'un document (CV ou lettre de motivation)
   * @param documentId L'ID du document
   * @returns Le contenu du document ou null en cas d'erreur
   */
  const getDocumentContent = async (documentUrl: string | undefined): Promise<string | null> => {
    if (!documentUrl) return null;
    
    try {
      setLoading(true);
      
      // Pour l'instant, on simule l'extraction du texte
      // Dans une implémentation réelle, vous utiliseriez extractTextFromPDF ou une autre méthode
      // selon le type de document
      
      const textContent = await extractTextFromPDF(documentUrl);
      return textContent;
      
    } catch (err: any) {
      console.error("Erreur lors de la récupération du contenu du document:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Analyse un CV par rapport à une offre de stage
   * @param cvUrl L'URL du CV
   * @param jobDescription La description du poste
   * @param requiredSkills Les compétences requises
   * @returns Une analyse détaillée du CV
   */
  const analyzeCVForJob = async (
    cvUrl: string | undefined,
    jobDescription: string,
    requiredSkills: string[]
  ): Promise<CVAnalysisResult | null> => {
    try {
      setLoading(true);
      
      // Récupérer le contenu du CV
      const cvContent = await getDocumentContent(cvUrl);
      if (!cvContent) {
        throw new Error("Impossible de récupérer le contenu du CV");
      }
      
      // Analyser le CV avec Gemini
      const analysis = await analyzeCV(cvContent, jobDescription, requiredSkills);
      return analysis;
      
    } catch (err: any) {
      console.error("Erreur lors de l'analyse du CV:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Analyse une lettre de motivation par rapport à une offre de stage
   * @param letterUrl L'URL de la lettre de motivation
   * @param jobDescription La description du poste
   * @returns Une analyse détaillée de la lettre de motivation
   */
  const analyzeMotivationLetterForJob = async (
    letterUrl: string | undefined,
    jobDescription: string
  ): Promise<MotivationLetterAnalysisResult | null> => {
    try {
      setLoading(true);
      
      // Récupérer le contenu de la lettre de motivation
      const letterContent = await getDocumentContent(letterUrl);
      if (!letterContent) {
        throw new Error("Impossible de récupérer le contenu de la lettre de motivation");
      }
      
      // Analyser la lettre de motivation avec Gemini
      const analysis = await analyzeMotivationLetter(letterContent, jobDescription);
      return analysis;
      
    } catch (err: any) {
      console.error("Erreur lors de l'analyse de la lettre de motivation:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Récupère les détails complets d'une candidature
   * @param candidatureId L'ID de la candidature
   * @returns Les détails complets de la candidature
   */
  const getCandidatureDetails = async (candidatureId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidatures')
        .select(`
          id,
          stage_id,
          stagiaire_id,
          cv_id,
          lettre_motivation_id,
          status,
          note,
          internal_rating,
          interview_date,
          interview_feedback,
          date_postulation,
          last_interaction,
          updated_at,
          stages (id, title, description, required_skills, location, type, compensation, education_level, entreprises(id, name, logo_url)),
          stagiaires (id, name, email, skills, education, bio),
          cv:documents!candidatures_cv_id_fkey (id, file_url, file_type, file_size),
          lettre:documents!candidatures_lettre_motivation_id_fkey (id, file_url, file_type, file_size)
        `)
        .eq('id', candidatureId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des détails de la candidature');
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCandidature,
    getCandidaturesByUser,
    getCandidaturesByEntreprise,
    updateCandidatureStatus,
    analyseCompetences,
    getDocumentContent,
    analyzeCVForJob,
    analyzeMotivationLetterForJob,
    getCandidatureDetails,
    loading,
    error
  };
};
