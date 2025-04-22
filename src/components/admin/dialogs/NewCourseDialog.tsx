
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseFormValues } from "@/components/admin/courses/form/CourseFormTypes";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCourse } from "@/services/course";

interface NewCourseDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewCourseDialog: React.FC<NewCourseDialogProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany, userCompanies, selectCompany, user } = useCompanies();
  const navigate = useNavigate();

  const handleFormSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      // Make sure the company ID is included in the companyIds array
      if (selectedCompany?.id && (!data.companyIds || !data.companyIds.includes(selectedCompany.id))) {
        if (!data.companyIds) {
          data.companyIds = [selectedCompany.id];
        } else if (!data.companyIds.includes(selectedCompany.id)) {
          data.companyIds.push(selectedCompany.id);
        }
      }
      
      console.log('Creating course with data:', {
        ...data,
        companyIds: data.companyIds || []
      });
      
      const courseId = await createCourse(data);
      
      if (courseId) {
        console.log(`Course ${courseId} created successfully. Notifications should be triggered.`);
        toast.success("Curso criado com sucesso.");
        
        // Espera um breve momento para garantir que as notificações sejam processadas
        setTimeout(() => {
          // Fecha o diálogo após o curso ser criado com sucesso
          onOpenChange(false);
          
          // Navigation occurs after successful course creation
          navigate(`/courses/${courseId}`);
        }, 700);
      } else {
        toast.error("Erro ao criar curso. Tente novamente.");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Erro ao criar curso.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                        className="h-4 w-4 mr-2 object-contain rounded-full"
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
          showCompanySelector={false}
        />
      </DialogContent>
    </Dialog>
  );
};
