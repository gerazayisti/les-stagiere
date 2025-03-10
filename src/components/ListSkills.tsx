
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface ListSkillsProps {
  skills: string[];
  selectedSkills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (index: number) => void;
}

export function ListSkills({ skills, selectedSkills, onAddSkill, onRemoveSkill }: ListSkillsProps) {
  const [newSkill, setNewSkill] = useState("");
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewSkill(value);
    
    if (value.trim() !== "") {
      const filtered = skills.filter(
        skill => 
          skill.toLowerCase().includes(value.toLowerCase()) && 
          !selectedSkills.includes(skill)
      );
      setFilteredSkills(filtered.slice(0, 5));
    } else {
      setFilteredSkills([]);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "") {
      onAddSkill(newSkill);
      setNewSkill("");
      setFilteredSkills([]);
    }
  };

  const handleSelectSuggestion = (skill: string) => {
    onAddSkill(skill);
    setNewSkill("");
    setFilteredSkills([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          value={newSkill}
          onChange={handleInputChange}
          placeholder="Ajouter une compétence"
          className="flex-1"
        />
        <Button 
          type="button" 
          size="sm"
          onClick={handleAddSkill}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {filteredSkills.length > 0 && (
        <div className="border rounded-md p-2 bg-background">
          {filteredSkills.map((skill) => (
            <div 
              key={skill} 
              className="py-1 px-2 hover:bg-accent rounded-sm cursor-pointer"
              onClick={() => handleSelectSuggestion(skill)}
            >
              {skill}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSkills.filter(s => s).map((skill, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1">
            {skill}
            <button
              type="button"
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => onRemoveSkill(index)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
