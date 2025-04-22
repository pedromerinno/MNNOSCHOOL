
import React, { useEffect, useState } from 'react';
import { JobRole } from "@/types/job-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import { toast } from "sonner";

interface JobRoleFormProps {
  role: Partial<JobRole>;
  isNew: boolean;
  onSave: (roleData: Partial<JobRole>) => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const formatBulletPoints = (text: string) => {
    if (!text) return '';
    
    // Split by new lines and filter empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Add bullet points if not present
    return lines.map(line => {
      const trimmedLine = line.trim();
      return trimmedLine.startsWith('•') ? trimmedLine : `• ${trimmedLine}`;
    }).join('\n');
  };

  const handleSaveValues = async () => {
    if (!formValues.title.trim()) {
      toast.error("O título do cargo é obrigatório");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Manter todos os campos do cargo original, mas atualizá-los com os novos valores
      const formattedValues = {
        ...role, // Mantém id, company_id, order_index e outros campos importantes
        title: formValues.title.trim(),
        description: formValues.description.trim() || null,
        responsibilities: formatBulletPoints(formValues.responsibilities) || null,
        requirements: formatBulletPoints(formValues.requirements) || null,
        expectations: formatBulletPoints(formValues.expectations) || null
      };
      
      console.log("Submitting role data:", formattedValues);
      onSave(formattedValues);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao salvar cargo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = (field: string) => {
    const placeholders = {
      responsibilities: "• Gerenciar projetos\n• Liderar equipe\n• Desenvolver estratégias",
      requirements: "• Experiência em gestão\n• Conhecimento em metodologias ágeis\n• Inglês avançado",
      expectations: "• Capacidade de liderança\n• Comunicação efetiva\n• Pensamento estratégico"
    };
    return placeholders[field as keyof typeof placeholders] || "";
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
              Responsabilidades (uma por linha)
            </Label>
            <Textarea
              id={isNew ? "new-responsibilities" : `edit-responsibilities-${role.id}`}
              value={formValues.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              placeholder={getPlaceholder('responsibilities')}
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor={isNew ? "new-requirements" : `edit-requirements-${role.id}`}>
              Requisitos (um por linha)
            </Label>
            <Textarea
              id={isNew ? "new-requirements" : `edit-requirements-${role.id}`}
              value={formValues.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              placeholder={getPlaceholder('requirements')}
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor={isNew ? "new-expectations" : `edit-expectations-${role.id}`}>
              Expectativas (uma por linha)
            </Label>
            <Textarea
              id={isNew ? "new-expectations" : `edit-expectations-${role.id}`}
              value={formValues.expectations}
              onChange={(e) => handleChange('expectations', e.target.value)}
              placeholder={getPlaceholder('expectations')}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveValues} type="button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
