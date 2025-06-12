
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Company } from "@/types/company";
import { EditableText } from "@/components/ui/EditableText";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const WelcomeSection = () => {
  const { user, userProfile } = useAuth();
  const { selectedCompany, updateCompany } = useCompanies();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayCompany, setDisplayCompany] = useState<Company | null>(selectedCompany);

  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  // Simplificar atualização da empresa
  useEffect(() => {
    if (selectedCompany && selectedCompany.id !== displayCompany?.id) {
      setDisplayCompany(selectedCompany);
    }
  }, [selectedCompany?.id]);

  const userName = userProfile?.display_name || user?.email?.split('@')[0] || 'Usuário';

  const handleLearnMore = () => {
    navigate('/integration');
  };

  const defaultPhrase = "Existimos para criar coisas impossíveis";
  const companyPhrase = displayCompany?.frase_institucional || defaultPhrase;

  const handleSavePhrase = async (newPhrase: string) => {
    if (!displayCompany || !isAdmin) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para editar esta frase",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({ frase_institucional: newPhrase })
        .eq('id', displayCompany.id);

      if (error) throw error;

      // Atualizar estado local
      const updatedCompany = { ...displayCompany, frase_institucional: newPhrase };
      setDisplayCompany(updatedCompany);
      
      // Atualizar no contexto de empresas
      if (updateCompany) {
        updateCompany(updatedCompany);
      }

      toast({
        title: "Sucesso",
        description: "Frase institucional atualizada com sucesso",
      });

    } catch (error: any) {
      console.error('Error updating company phrase:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar a frase",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="mb-16 mt-10">
      <div className="flex flex-col items-center">
        <p 
          className="text-gray-700 dark:text-gray-200 mb-6 text-center bg-[#FFF5E4] dark:bg-[#333333] py-1.5 px-6 rounded-full max-w-fit text-sm font-semibold"
        >
          Olá, {userName}
        </p>
        
        {isAdmin && displayCompany ? (
          <EditableText
            value={companyPhrase}
            onSave={handleSavePhrase}
            multiline={true}
            className="text-foreground text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
            placeholder="Digite a frase institucional..."
            canEdit={true}
          />
        ) : (
          <p 
            className="text-foreground text-center text-[40px] font-normal max-w-[50%] leading-[1.1] mb-5"
          >
            {companyPhrase}
          </p>
        )}
        
        <Button 
          onClick={handleLearnMore} 
          className="mt-1 flex items-center gap-2 text-white dark:text-black rounded-full text-sm transition-colors duration-300 bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90"
          variant="default"
        >
          Saiba mais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
