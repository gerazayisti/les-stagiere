import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  cv?: File | null;
  lettre_motivation?: File | null;
  status?: 'en_attente' | 'acceptee' | 'refusee' | 'en_discussion';
}

export interface CompetenceAnalysis {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
}

export const useCandidatures = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File, stagiaireId: string, type: 'cv' | 'lettre_motivation') => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${stagiaireId}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `${stagiaireId}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document metadata to database
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          stagiaire_id: stagiaireId,
          type: type === 'cv' ? 'CV' : 'Lettre de motivation',
          name: fileName,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          is_primary: true
        })
        .select()
        .single();

      if (documentError) throw documentError;

      return documentData.id;
    } catch (err: any) {
      console.error(`Erreur lors de l'upload du ${type}:`, err);
      toast.error(`Impossible de télécharger le ${type}`);
      return null;
    }
  };

  const createCandidature = async ({ 
    stage_id, 
    stagiaire_id, 
    cv, 
    lettre_motivation, 
    status = 'en_attente' 
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
          required_skills,
          candidatures (
            *,
            stagiaires (
              id,
              name,
              skills
            )
          )
        `)
        .eq('entreprise_id', entrepriseId);

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

  return {
    createCandidature,
    getCandidaturesByUser,
    getCandidaturesByEntreprise,
    updateCandidatureStatus,
    analyseCompetences,
    loading,
    error
  };
};
