
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { CompanySelectorField } from "@/components/admin/courses/form/CompanySelectorField";

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
        {/* Mostra o logo e nome da empresa atual se houver */}
        {selectedCompany && (
          <div className="flex flex-col items-center mb-4">
            {selectedCompany.logo && (
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.nome ?? "Logo"}
                className="w-20 h-20 object-contain rounded mb-1"
                style={{ background: "#f7f7f7", border: "1px solid #eee" }}
              />
            )}
            <span className="font-medium text-gray-700">{selectedCompany.nome}</span>
          </div>
        )}
        {/* Seletor de empresa sempre visível */}
        <div className="mb-4">
          <CompanySelectorField
            form={{
              // Cria uma interface fake para controlar só a troca de empresa aqui,
              // pois o form principal mantém sua lógica normalmente
              control: {
                // Apenas plugar onchange (não usado via react-hook-form real)
              }
            } as any}
            showCompanySelector={true}
            // @ts-ignore
            fieldValue={selectedCompany?.id || ""}
            onValueChange={handleCompanyChange}
            overrideUserCompanies={userCompanies}
          />
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
