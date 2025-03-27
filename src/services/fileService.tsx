// src/services/fileService.tsx
import { supabase } from '@/lib/supabase';

export const FileService = {
  uploadCV: async (userId: string, file: File) => {
    // Versioning : ajout timestamp au nom
    const versionedName = `${Date.now()}_${file.name}`;
    const filePath = `cv/${userId}/${versionedName}`;
    
    // Vérification type de fichier
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté');
    }

    const { data, error } = await supabase.storage
      .from('cvdocuments')
      .upload(filePath, file);

    return { data, error };
  },

  getCVList: async (userId: string) => {
    const { data, error } = await supabase.storage
      .from('cvdocuments')
      .list(`cv/${userId}/`);

    return { data, error };
  },

  deleteCV: async (filePath: string) => {
    const { error } = await supabase.storage
      .from('cvdocuments')
      .remove([filePath]);

    return { error };
  },

  getPublicUrl: (filePath: string) => {
    return supabase.storage
      .from('cvdocuments')
      .getPublicUrl(filePath);
  },

  // Méthode pour les versions
  getDocumentVersions: async (userId: string, fileName: string) => {
    const { data } = await supabase.storage
      .from('cvdocuments')
      .list(`cv/${userId}/`, {
        search: fileName
      });

    return data?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];
  },
};