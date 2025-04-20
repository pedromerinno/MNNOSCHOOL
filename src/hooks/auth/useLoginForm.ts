
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
      clearCache('userCompanies');
      clearCache('selectedCompany');
      clearCache('selectedCompanyId');
      
      const { data, error } = await signInWithPassword(email, password);
      if (error) throw error;

      if (data?.session?.user) {
        console.log("Login successful, fetching companies...");
        
        const companies = await forceGetUserCompanies(data.session.user.id);
        console.log("Companies fetched:", companies);
        
        if (companies?.length > 0) {
          console.log("Selecting first company:", companies[0].nome);
          
          try {
            await selectCompany(data.session.user.id, companies[0]);
            console.log("Company selected successfully");
            toast.success("Login realizado com sucesso!");
            
            setTimeout(() => {
              navigate('/');
            }, 100);
          } catch (selectionError) {
            console.error("Error selecting company:", selectionError);
            toast.error("Erro ao selecionar empresa");
          }
        } else {
          console.error("No companies available for user");
          toast.error("Nenhuma empresa disponível para este usuário");
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
