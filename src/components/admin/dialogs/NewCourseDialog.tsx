
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewCourseDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewCourseDialog: React.FC<NewCourseDialogProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany, userCompanies, selectCompany, user } = useCompanies();

  const handleFormSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise(res => setTimeout(res, 1200));
      toast.success("Curso criado com sucesso.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao criar curso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quando o usuário trocar a empresa via select, atualize no contexto
  const handleCompanyChange = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      selectCompany(user.id, company);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Curso</DialogTitle>
        </DialogHeader>
        {/* Removido logo e nome da empresa */}
        {/* Seletor de empresa sempre visível */}
        <div className="mb-4">
          <Label>Empresa</Label>
          <Select 
            value={selectedCompany?.id || ""} 
            onValueChange={handleCompanyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma empresa" />
            </SelectTrigger>
            <SelectContent>
              {userCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center">
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt={company.nome}
                        className="h-4 w-4 mr-2 object-contain rounded-lg"
                      />
                    )}
                    <span>{company.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CourseForm
          onSubmit={handleFormSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          onClose={() => onOpenChange(false)}
          preselectedCompanyId={selectedCompany?.id}
        />
      </DialogContent>
    </Dialog>
  );
};
