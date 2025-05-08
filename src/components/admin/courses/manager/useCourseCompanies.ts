import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';
import { Course } from '../types';
import { useAuth } from '@/contexts/AuthContext';

export const useCourseCompanies = (course: Course) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  // Usar useEffect com dependência course.id para evitar carregamentos desnecessários
  useEffect(() => {
    const fetchData = async () => {
      if (!course?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Buscando empresas para o curso:", course.title);
        
        let companiesData;
        
        // Fetch companies based on user role
        if (userProfile?.super_admin) {
          // Super admins see all companies
          const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('nome');
            
          if (error) throw error;
          companiesData = data;
        } else {
          // Regular admins only see companies they're related to
          const { data, error } = await supabase
            .rpc('get_user_companies', { user_id: userProfile?.id })
            
          if (error) throw error;
          companiesData = data;
        }

        // Garantir que temos um array válido com valores padrão
        const companiesWithDefaults = Array.isArray(companiesData) ? companiesData.map(company => ({
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
        })) as Company[] : [];

        // Buscar relações de curso para empresas
        const { data: courseCompaniesData, error: courseCompaniesError } = await supabase
          .from('company_courses')
          .select('empresa_id')
          .eq('course_id', course.id);

        if (courseCompaniesError) {
          console.error("Erro ao buscar relações empresa-curso:", courseCompaniesError);
          setSelectedCompanies([]);
        } else if (courseCompaniesData && courseCompaniesData.length > 0) {
          const companyIds = courseCompaniesData.map(item => item.empresa_id);
          setSelectedCompanies(companyIds);
          console.log("Empresas com acesso encontradas:", companyIds.length);
        } else {
          console.log("Nenhuma empresa tem acesso a este curso ainda");
          setSelectedCompanies([]);
        }

        setCompanies(companiesWithDefaults);
        console.log(`Encontradas ${companiesWithDefaults.length} empresas`);
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive',
        });
        // Garantir array vazio em caso de erro
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [course.id, toast, userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Salvando acesso ao curso para:", course.title);
      console.log("Empresas selecionadas:", selectedCompanies.length);
      
      // Excluir todas as relações existentes para este curso
      const { error: deleteError } = await supabase
        .from('company_courses')
        .delete()
        .eq('course_id', course.id);

      if (deleteError) throw deleteError;

      // Se houver empresas selecionadas, criar novas relações
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
      console.error("Erro ao salvar:", error);
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
