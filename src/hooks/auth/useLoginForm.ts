
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
  const { forceGetUserCompanies, selectCompany } = useCompanies();
  const { clearCache } = useCache();

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    
    try {
      // Limpar cache relacionado a empresas para garantir dados frescos
      clearCache('userCompanies');
      clearCache('selectedCompany');
      clearCache('selectedCompanyId');
      
      const { data, error } = await signInWithPassword(email, password);
      if (error) throw error;

      if (data?.session?.user) {
        console.log("Login bem-sucedido, buscando empresas...");
        
        // Forçar busca atualizada de empresas do usuário
        const companies = await forceGetUserCompanies(data.session.user.id);
        console.log("Empresas encontradas:", companies?.length || 0);
        
        if (companies?.length > 0) {
          console.log("Selecionando a primeira empresa disponível:", companies[0].nome);
          
          try {
            // Selecionar a primeira empresa disponível
            await selectCompany(data.session.user.id, companies[0]);
            console.log("Empresa selecionada com sucesso");
            toast.success("Login realizado com sucesso!");
            
            // Usar setTimeout para evitar problemas de navegação durante transições de estado
            setTimeout(() => {
              navigate('/');
            }, 100);
          } catch (selectionError) {
            console.error("Erro ao selecionar empresa:", selectionError);
            toast.error("Erro ao selecionar empresa");
          }
        } else {
          console.log("Nenhuma empresa disponível para este usuário");
          toast.error("Nenhuma empresa disponível para este usuário");
          
          // Redirecionar para a página inicial mesmo sem empresas
          // para exibir o componente NoCompaniesAvailable
          setTimeout(() => {
            navigate('/');
          }, 100);
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
