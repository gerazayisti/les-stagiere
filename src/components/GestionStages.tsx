
import React, { useState } from 'react';
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
  MapPin, BriefcaseBusiness, Clock, Ban, CheckCircle2
} from "lucide-react";
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Stage {
  id: string;
  titre: string;
  description: string;
  lieu: string;
  date_debut: string;
  duree: string;
  remuneration: string;
  competences: string[];
  date_publication: string;
  status?: 'active' | 'expired' | 'draft';
}

interface GestionStagesProps {
  stages: Stage[];
  enterpriseId: string;
}

export function GestionStages({ stages, enterpriseId }: GestionStagesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: fr });
  };

  const filteredStages = stages.filter(
    (stage) =>
      stage.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.lieu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Offres de stages</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une offre
        </Button>
      </div>

      {stages.length === 0 ? (
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
                  <TableCell className="font-medium">{stage.titre}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {stage.lieu}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {new Date(stage.date_debut).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {stage.duree}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatTimeAgo(stage.date_publication)}
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
                        <DropdownMenuItem className="text-red-600">
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

      {/* Ici nous pourrions ajouter un formulaire modal pour ajouter/modifier une offre */}
    </div>
  );
}
