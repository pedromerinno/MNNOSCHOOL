
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';
import { Course } from '../types';

export const useCourseCompanies = (course: Course) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching companies for course:", course.title);
        
        const { data: companiesData, error: companiesError } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');

        if (companiesError) throw companiesError;

        const companiesWithDefaults = companiesData?.map(company => ({
          ...company,
          descricao: null,
          responsavel: null,
          cor_principal: company.cor_principal || null,
          logo: company.logo || null,
          frase_institucional: company.frase_institucional || null,
          missao: company.missao || null,
          historia: company.historia || null,
          valores: company.valores || null,
          video_institucional: company.video_institucional || null,
          descricao_video: company.descricao_video || null
        })) as Company[];

        const { data: courseCompaniesData, error: courseCompaniesError } = await supabase
          .from('company_courses')
          .select('empresa_id')
          .eq('course_id', course.id);

        if (courseCompaniesError) {
          console.error("Error fetching company course relationships:", courseCompaniesError);
          setSelectedCompanies([]);
        } else if (courseCompaniesData && courseCompaniesData.length > 0) {
          const companyIds = courseCompaniesData.map(item => item.empresa_id);
          setSelectedCompanies(companyIds);
          console.log("Found companies with access:", companyIds.length);
        } else {
          console.log("No companies have access to this course yet");
          setSelectedCompanies([]);
        }

        setCompanies(Array.isArray(companiesWithDefaults) ? companiesWithDefaults : []);
        console.log(`Found ${Array.isArray(companiesData) ? companiesData.length : 0} companies`);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        });
        // Set empty array in case of error
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [course.id, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving course access for:", course.title);
      console.log("Selected companies:", selectedCompanies.length);
      
      const { error: deleteError } = await supabase
        .from('company_courses')
        .delete()
        .eq('course_id', course.id);

      if (deleteError) throw deleteError;

      if (selectedCompanies.length > 0) {
        const newRelationships = selectedCompanies.map(companyId => ({
          course_id: course.id,
          empresa_id: companyId
        }));

        const { error: insertError } = await supabase
          .from('company_courses')
          .insert(newRelationships as any);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Alterações salvas',
        description: 'As relações entre curso e empresas foram atualizadas com sucesso.',
      });

      return true;
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: 'Erro ao salvar alterações',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  return {
    companies,
    selectedCompanies,
    isLoading,
    isSaving,
    handleToggleCompany,
    handleSave
  };
};
