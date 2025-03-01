
import React, { useState, useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, Plus, MoreHorizontal, Edit, Trash2, Calendar, 
  MapPin, BriefcaseBusiness, Clock, Ban, CheckCircle2, Search
} from "lucide-react";
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { AddStageForm } from './AddStageForm';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Stage {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  duration: string;
  compensation?: {
    amount: number;
    currency: string;
    period: string;
  };
  required_skills: string[];
  created_at: string;
  status?: 'active' | 'expired' | 'draft';
}

interface GestionStagesProps {
  enterpriseId: string;
}

export function GestionStages({ enterpriseId }: GestionStagesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStages();
  }, [enterpriseId]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('entreprise_id', enterpriseId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setStages(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des stages:", error);
      toast.error("Impossible de charger les offres de stage");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: fr });
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre de stage ?")) {
      try {
        const { error } = await supabase
          .from('stages')
          .delete()
          .eq('id', stageId);

        if (error) {
          throw error;
        }

        setStages(stages.filter(stage => stage.id !== stageId));
        toast.success("Offre de stage supprimée avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression du stage:", error);
        toast.error("Impossible de supprimer l'offre de stage");
      }
    }
  };

  const filteredStages = stages.filter(
    (stage) =>
      stage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Offres de stages</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une offre
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher par titre ou lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Clock className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Chargement des offres...</p>
        </div>
      ) : stages.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center">
          <BriefcaseBusiness className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucune offre de stage
          </h3>
          <p className="mt-2 text-gray-500">
            Vous n'avez pas encore publié d'offres de stage. Commencez par en
            créer une nouvelle.
          </p>
          <Button className="mt-4" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Créer ma première offre
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Publiée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell className="font-medium">{stage.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {stage.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {new Date(stage.start_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {stage.duration}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatTimeAgo(stage.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        stage.status === 'expired' 
                          ? 'destructive' 
                          : stage.status === 'draft' 
                            ? 'outline' 
                            : 'default'
                      }
                    >
                      {stage.status === 'expired' ? (
                        <Ban className="h-3 w-3 mr-1" />
                      ) : stage.status === 'draft' ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {stage.status === 'expired' 
                        ? 'Expirée' 
                        : stage.status === 'draft' 
                          ? 'Brouillon' 
                          : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteStage(stage.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddStageForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        entrepriseId={enterpriseId}
        onSuccess={fetchStages}
      />
    </div>
  );
}
