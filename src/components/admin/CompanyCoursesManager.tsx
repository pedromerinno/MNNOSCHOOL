
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course } from './CourseManagement';
import { Company } from '@/types/company';

interface CompanyCoursesManagerProps {
  course: Course;
  onClose: () => void;
}

export const CompanyCoursesManager: React.FC<CompanyCoursesManagerProps> = ({ 
  course, 
  onClose 
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');

        if (companiesError) throw companiesError;

        // Fetch companies that have access to this course
        const { data: courseCompaniesData, error: courseCompaniesError } = await supabase
          .from('company_courses')
          .select('company_id')
          .eq('course_id', course.id);

        if (courseCompaniesError) throw courseCompaniesError;

        setCompanies(companiesData || []);
        setSelectedCompanies(courseCompaniesData?.map(cc => cc.company_id) || []);
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [course.id, toast]);

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First, delete all existing relationships
      const { error: deleteError } = await supabase
        .from('company_courses')
        .delete()
        .eq('course_id', course.id);

      if (deleteError) throw deleteError;

      // Then, insert the new relationships
      if (selectedCompanies.length > 0) {
        const newRelationships = selectedCompanies.map(companyId => ({
          course_id: course.id,
          company_id: companyId
        }));

        const { error: insertError } = await supabase
          .from('company_courses')
          .insert(newRelationships);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Alterações salvas',
        description: 'As relações entre curso e empresas foram atualizadas com sucesso.',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar alterações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            Selecione as empresas que devem ter acesso a este curso:
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 border rounded-md p-4">
            {companies.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma empresa encontrada
              </div>
            ) : (
              companies.map(company => (
                <div key={company.id} className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id={`company-${company.id}`}
                    checked={selectedCompanies.includes(company.id)}
                    onCheckedChange={() => handleToggleCompany(company.id)}
                  />
                  <label 
                    htmlFor={`company-${company.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {company.nome}
                  </label>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
