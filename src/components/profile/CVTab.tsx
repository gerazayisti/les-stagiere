
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { InteractiveCV } from "./InteractiveCV";
import { Plus, Upload, Lock, FileText, Trash2 } from "lucide-react";
import { CVAnalyzer } from "@/components/CVAnalyzer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
}

export interface CVTabProps {
  userId: string;
  isPremium?: boolean;
}

export function CVTab({ userId, isPremium = false }: CVTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [activeTab, setActiveTab] = useState('cv');
  const { user } = useAuth();
  const isOwner = user?.id === userId;
  
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('stagiaire_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [userId]);
  
  // Find CV and cover letter
  const cv = documents.find(doc => doc.type === 'cv');
  const coverLetter = documents.find(doc => doc.type === 'cover_letter');
  
  // Document upload handler
  const handleDocumentUpload = async (type: 'cv' | 'cover_letter') => {
    // Check premium status
    if (!isPremium) {
      const existingDocs = documents.filter(doc => doc.type === type);
      if (existingDocs.length >= 1) {
        toast.error(`Version Premium requise pour télécharger plus d'un ${type === 'cv' ? 'CV' : 'lettre de motivation'}`);
        return;
      }
    }
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // Upload file to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}_${Date.now()}.${fileExt}`;
        const filePath = `documents/${userId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);
          
        // Insert document record
        const { data, error } = await supabase
          .from('documents')
          .insert({
            stagiaire_id: userId,
            name: file.name,
            url: publicUrl,
            type: type,
            is_public: true
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success(`${type === 'cv' ? 'CV' : 'Lettre de motivation'} téléchargé avec succès`);
        fetchDocuments();
      } catch (error) {
        console.error('Error uploading document:', error);
        toast.error("Erreur lors du téléchargement du document");
      }
    };
    
    input.click();
  };
  
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
        
      if (error) throw error;
      
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document supprimé avec succès");
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Erreur lors de la suppression du document");
    }
  };

  const renderDocumentList = (type: 'cv' | 'cover_letter') => {
    const filteredDocs = documents.filter(doc => doc.type === type);
    const typeName = type === 'cv' ? 'CV' : 'Lettre de motivation';
    
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }
    
    if (filteredDocs.length === 0) {
      return (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium">Aucun {typeName} téléchargé</h3>
          {isOwner && (
            <>
              <p className="text-muted-foreground mt-2 mb-4">
                Téléchargez votre {typeName.toLowerCase()} pour le mettre à disposition des recruteurs
              </p>
              <Button onClick={() => handleDocumentUpload(type)}>
                <Upload className="mr-2 h-4 w-4" />
                Télécharger un {typeName}
              </Button>
            </>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredDocs.map(doc => (
          <Card key={doc.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Ajouté le {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    Voir
                  </a>
                </Button>
                {isOwner && (
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {isOwner && (
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => handleDocumentUpload(type)}
              disabled={!isPremium && filteredDocs.length >= 1}
            >
              <Upload className="mr-2 h-4 w-4" />
              Ajouter un {typeName}
            </Button>
          </div>
        )}
        
        {!isPremium && isOwner && filteredDocs.length >= 1 && (
          <div className="mt-2 p-4 border rounded-lg bg-muted/10 flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-500" />
            <span className="text-sm">Passez à la version Premium pour télécharger plus de documents</span>
            <Button variant="default" size="sm" className="ml-auto" onClick={() => window.location.href = "/abonnement"}>
              Passer à Premium
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
      <div className="space-y-6 p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="cover_letter">Lettres de motivation</TabsTrigger>
            {isPremium && cv && <TabsTrigger value="interactive">CV Interactif</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="cv">
            {renderDocumentList('cv')}
          </TabsContent>
          
          <TabsContent value="cover_letter">
            {renderDocumentList('cover_letter')}
          </TabsContent>
          
          {isPremium && cv && (
            <TabsContent value="interactive">
              <InteractiveCV cvUrl={cv.url} />
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAnalyzer(true)}
                >
                  Analyser mon CV avec l'IA
                </Button>
              </div>
              {showAnalyzer && (
                <div className="mt-10">
                  <CVAnalyzer />
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
        
        {!isPremium && cv && (
          <div className="border rounded-lg p-6 bg-muted/10 mt-8">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                CV interactif (Fonctionnalité Premium)
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Mettez en valeur votre parcours avec notre CV interactif et faites analyser 
                votre CV par notre IA pour augmenter vos chances de décrocher un stage.
              </p>
              <Button 
                variant="default"
                onClick={() => window.location.href = "/abonnement"}
              >
                Passer à la version Premium
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
