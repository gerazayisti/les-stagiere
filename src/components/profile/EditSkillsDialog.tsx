
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, X, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditSkillsDialogProps {
  stagiaireId: string;
  initialSkills: string[];
  skillType: "skills" | "languages" | "preferred_locations";
  title: string;
  onSuccess?: () => void;
}

export function EditSkillsDialog({ 
  stagiaireId, 
  initialSkills = [],
  skillType,
  title,
  onSuccess
}: EditSkillsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      toast.error("Cet élément existe déjà");
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("stagiaires")
        .update({ [skillType]: skills })
        .eq("id", stagiaireId);

      if (error) throw error;
      
      toast.success("Mise à jour réussie");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des ${skillType}:`, error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-1">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ajouter un nouvel élément"
              />
              <Button onClick={addSkill} type="button" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-20">
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun élément ajouté</p>
              ) : (
                skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1 py-1.5">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
