import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";
import { CompanyValue } from "@/types/company";

interface AddCompanyValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValueAdded?: () => void;
}

export const AddCompanyValueDialog: React.FC<AddCompanyValueDialogProps> = ({
  open,
  onOpenChange,
  onValueAdded,
}) => {
  const { selectedCompany, setSelectedCompany } = useCompanies();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const handleSubmit = async () => {
    // Validações com feedback
    if (!selectedCompany?.id) {
      toast.error("Por favor, selecione uma empresa no menu superior primeiro");
      return;
    }

    if (!title.trim() || title.trim().length < 2) {
      toast.error("Por favor, informe um título com pelo menos 2 caracteres");
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      toast.error("Por favor, informe uma descrição com pelo menos 5 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      // Parse existing values
      let currentValues: CompanyValue[] = [];
      if (selectedCompany.valores) {
        try {
          const parsed = JSON.parse(selectedCompany.valores);
          if (Array.isArray(parsed)) {
            currentValues = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            currentValues = [parsed];
          }
        } catch (e) {
          // If it's not valid JSON, treat as empty
          console.warn("Error parsing valores:", e);
        }
      }

      // Add new value
      const newValue: CompanyValue = {
        title: title.trim(),
        description: description.trim(),
      };
      const updatedValues = [...currentValues, newValue];

      // Update company in database
      const { error } = await supabase
        .from('empresas')
        .update({
          valores: JSON.stringify(updatedValues),
        })
        .eq('id', selectedCompany.id);

      if (error) throw error;

      // Update local state
      const updatedCompany = {
        ...selectedCompany,
        valores: JSON.stringify(updatedValues),
      };
      setSelectedCompany(updatedCompany);

      // Dispatch event to update other components
      window.dispatchEvent(new Event('company-relation-changed'));
      window.dispatchEvent(new CustomEvent('company-changed', {
        detail: { company: updatedCompany }
      }));

      toast.success("Valor adicionado com sucesso");
      
      // Fechar popup imediatamente após sucesso
      resetForm();
      onOpenChange(false);
      
      // Call callback if provided
      if (onValueAdded) {
        onValueAdded();
      }
    } catch (error: any) {
      console.error("Erro ao adicionar valor:", error);
      toast.error(`Erro ao adicionar valor: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!selectedCompany?.id) return false;
    if (!title.trim() || title.trim().length < 2) return false;
    if (!description.trim() || description.trim().length < 5) return false;
    return true;
  };

  const sections: SettingsSection[] = useMemo(() => {
    // General Section Content
    const generalSectionContent = (
      <div className="space-y-8">
        {/* Company Info Warning */}
        {!selectedCompany && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>Por favor, selecione uma empresa no menu superior primeiro</span>
            </p>
          </div>
        )}

        {/* Value Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
            Título do Valor
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Inovação"
            required
            className="h-10"
          />
          {title.trim().length > 0 && title.trim().length < 2 && (
            <p className="text-xs text-orange-600">
              O título deve ter pelo menos 2 caracteres
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
            Descrição
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição deste valor para a empresa"
            rows={4}
            className="resize-none"
            required
          />
          {description.trim().length > 0 && description.trim().length < 5 && (
            <p className="text-xs text-orange-600">
              A descrição deve ter pelo menos 5 caracteres
            </p>
          )}
        </div>
      </div>
    );

    return [
      {
        id: 'general',
        label: 'General',
        content: generalSectionContent
      }
    ];
  }, [title, description, selectedCompany]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Valor"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSubmit}
      saveLabel="Adicionar"
      cancelLabel="Cancelar"
      isSaving={submitting}
      isFormValid={isFormValid() && !!selectedCompany}
      saveButtonStyle={isFormValid() && selectedCompany ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
      maxWidth="max-w-2xl"
    />
  );
};

