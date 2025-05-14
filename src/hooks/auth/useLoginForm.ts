
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useCache } from "@/hooks/useCache";
import { toast } from "sonner";

export const useLoginForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();
  const { forceGetUserCompanies, selectCompany } = useCompanies({ skipLoadingInOnboarding: true });
  const { clearCache } = useCache();

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    
    try {
      // Clear all relevant cache
      clearCache({ key: 'userCompanies' });
      clearCache({ key: 'selectedCompany' });
      clearCache({ key: 'selectedCompanyId' });
      clearCache({ key: 'notices' });
      clearCache({ key: 'courses' });
      clearCache({ key: 'access' });
      
      // Limpar todos os caches de localStorage diretamente para garantir limpeza completa
      localStorage.removeItem('userCompanies');
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('selectedCompanyId');
      console.log("Login: Cache limpo antes de realizar login");
      
      const { data, error } = await signInWithPassword(email, password);
      if (error) throw error;

      if (data?.session?.user) {
        console.log("Login bem-sucedido, buscando empresas...");
        
        try {
          // Forçar busca atualizada de empresas do usuário
          const companies = await forceGetUserCompanies(data.session.user.id);
          console.log("Empresas encontradas:", companies?.length || 0);
          
          // Verificar se o usuário tem empresas associadas
          if (companies?.length > 0) {
            console.log("Selecionando a primeira empresa disponível:", companies[0].nome);
            
            // Selecionar a primeira empresa disponível
            await selectCompany(data.session.user.id, companies[0]);
            console.log("Empresa selecionada com sucesso");
            toast.success("Login realizado com sucesso!");
            
            // Usar replace para evitar problemas com o histórico de navegação
            navigate('/', { replace: true });
          } else {
            console.log("Nenhuma empresa disponível para este usuário, redirecionando para onboarding");
            toast.success("Login realizado com sucesso!");
            
            // Redirecionar para onboarding caso não tenha empresas
            navigate('/onboarding', { replace: true });
          }
        } catch (fetchError) {
          console.error("Erro ao buscar empresas:", fetchError);
          toast.success("Login realizado com sucesso!");
          navigate('/', { replace: true });
        }
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(error.message || "Falha ao fazer login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return {
    isLoggingIn,
    handleLogin
  };
};
