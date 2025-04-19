
import React, { useEffect, useState } from 'react';
import { JobRole } from "@/types/job-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Save } from "lucide-react";

interface JobRoleFormProps {
  role: Partial<JobRole>;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const JobRoleForm = ({
  role,
  isNew,
  onSave,
  onCancel
}: JobRoleFormProps) => {
  const [formValues, setFormValues] = useState({
    title: role.title || '',
    description: role.description || '',
    responsibilities: role.responsibilities || '',
    requirements: role.requirements || '',
    expectations: role.expectations || ''
  });

  useEffect(() => {
    setFormValues({
      title: role.title || '',
      description: role.description || '',
      responsibilities: role.responsibilities || '',
      requirements: role.requirements || '',
      expectations: role.expectations || ''
    });
  }, [role]);

  const handleChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveValues = () => {
    onSave();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor={isNew ? "new-title" : `edit-title-${role.id}`}>
              Título do Cargo*
            </Label>
            <Input
              id={isNew ? "new-title" : `edit-title-${role.id}`}
              value={formValues.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Desenvolvedor Frontend"
            />
          </div>

          <div>
            <Label htmlFor={isNew ? "new-description" : `edit-description-${role.id}`}>
              Descrição
            </Label>
            <Textarea
              id={isNew ? "new-description" : `edit-description-${role.id}`}
              value={formValues.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição geral do cargo"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor={isNew ? "new-responsibilities" : `edit-responsibilities-${role.id}`}>
              Responsabilidades
            </Label>
            <Textarea
              id={isNew ? "new-responsibilities" : `edit-responsibilities-${role.id}`}
              value={formValues.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              placeholder="Responsabilidades do cargo"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor={isNew ? "new-requirements" : `edit-requirements-${role.id}`}>
              Requisitos
            </Label>
            <Textarea
              id={isNew ? "new-requirements" : `edit-requirements-${role.id}`}
              value={formValues.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              placeholder="Requisitos e habilidades necessárias"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor={isNew ? "new-expectations" : `edit-expectations-${role.id}`}>
              Expectativas
            </Label>
            <Textarea
              id={isNew ? "new-expectations" : `edit-expectations-${role.id}`}
              value={formValues.expectations}
              onChange={(e) => handleChange('expectations', e.target.value)}
              placeholder="Expectativas do cargo"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveValues}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
