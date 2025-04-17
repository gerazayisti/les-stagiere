import React, { useState } from 'react';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Clock, MapPin, Briefcase, Tag, Users, DollarSign, AlertTriangle, X } from 'lucide-react';

type StageType = 'temps_plein' | 'temps_partiel' | 'alternance' | 'remote';
type StageStatus = 'draft' | 'active' | 'expired';

interface StageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: any;
  onUpdate: (updatedStage: any) => void;
}

export const StageDetailsModal: React.FC<StageDetailsModalProps> = ({
  isOpen,
  onClose,
  stage,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStage, setEditedStage] = useState({ ...stage });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stages')
        .update(editedStage)
        .eq('id', stage.id)
        .select();

      if (error) throw error;

      toast.success('Offre de stage mise à jour');
      onUpdate(data[0]);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      toast.error('Impossible de mettre à jour l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: StageStatus) => {
    const statusConfig = {
      'draft': { color: 'bg-yellow-100 text-yellow-800', label: 'Brouillon' },
      'active': { color: 'bg-green-100 text-green-800', label: 'Actif' },
      'expired': { color: 'bg-red-100 text-red-800', label: 'Expiré' }
    };
    return (
      <Badge variant="outline" className={statusConfig[status].color}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  const renderTypeIcon = (type: StageType) => {
    const typeIcons = {
      'temps_plein': <Briefcase className="w-5 h-5 mr-2" />,
      'temps_partiel': <Clock className="w-5 h-5 mr-2" />,
      'alternance': <Users className="w-5 h-5 mr-2" />,
      'remote': <MapPin className="w-5 h-5 mr-2" />
    };
    return typeIcons[type];
  };

  if (!isOpen) return null;

  const renderViewMode = () => (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 dark:text-zinc-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border dark:border-zinc-700">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-zinc-300" />
        </button>
        <div className="p-6 border-b dark:border-zinc-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">{stage.title}</h2>
          <div className="flex items-center space-x-2">
            {renderStatusBadge(stage.status)}
            {stage.is_urgent && (
              <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" /> Urgent
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              {renderTypeIcon(stage.type)}
              <span>{stage.type === 'temps_plein' ? 'Temps plein' : 
                      stage.type === 'temps_partiel' ? 'Temps partiel' : 
                      stage.type === 'alternance' ? 'Alternance' : 
                      stage.type === 'remote' ? 'Télétravail' : stage.type}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-muted-foreground dark:text-zinc-400" />
              <span className="dark:text-zinc-300">{stage.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-muted-foreground dark:text-zinc-400" />
              <span className="dark:text-zinc-300">{stage.duration}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-muted-foreground dark:text-zinc-400" />
              <span className="dark:text-zinc-300">{stage.salary || 'Non communiqué'}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-zinc-200">Description</h3>
            <p className="text-gray-700 dark:text-zinc-300 whitespace-pre-line">{stage.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-zinc-200">Compétences requises</h3>
              <div className="flex flex-wrap gap-2">
                {stage.required_skills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="dark:bg-zinc-800 dark:text-zinc-200">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-zinc-200">Compétences préférées</h3>
              <div className="flex flex-wrap gap-2">
                {stage.preferred_skills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="dark:border-zinc-600 dark:text-zinc-300">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-zinc-400">
              Publié {formatDistance(new Date(stage.created_at), new Date(), { locale: fr })} ago
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsEditing(true)} className="dark:border-zinc-600 dark:text-zinc-200">
                <Edit className="w-4 h-4 mr-2" /> Modifier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 dark:text-zinc-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border dark:border-zinc-700">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-zinc-300" />
        </button>
        <div className="p-6 border-b dark:border-zinc-700">
          <h2 className="text-2xl font-bold dark:text-white">Modifier l'offre de stage</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label className="dark:text-zinc-200">Titre</Label>
            <Input 
              value={editedStage.title} 
              onChange={(e) => setEditedStage({...editedStage, title: e.target.value})}
              className="dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600"
            />
          </div>
          <div>
            <Label className="dark:text-zinc-200">Description</Label>
            <Textarea 
              value={editedStage.description} 
              onChange={(e) => setEditedStage({...editedStage, description: e.target.value})}
              className="dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600"
            />
          </div>
          <div>
            <Label className="dark:text-zinc-200">Type de stage</Label>
            <Select
              value={editedStage.type}
              onValueChange={(value) => setEditedStage({...editedStage, type: value})}
            >
              <SelectTrigger className="dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600">
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-800 dark:text-zinc-200">
                <SelectItem value="temps_plein">Temps plein</SelectItem>
                <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                <SelectItem value="alternance">Alternance</SelectItem>
                <SelectItem value="remote">Télétravail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="dark:text-zinc-200">Statut</Label>
            <Select
              value={editedStage.status}
              onValueChange={(value) => setEditedStage({...editedStage, status: value})}
            >
              <SelectTrigger className="dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600">
                <SelectValue placeholder="Sélectionnez le statut" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-800 dark:text-zinc-200">
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="dark:border-zinc-600 dark:text-zinc-200">
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading} className="dark:border-zinc-600 dark:text-zinc-200">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return isEditing ? renderEditMode() : renderViewMode();
};
