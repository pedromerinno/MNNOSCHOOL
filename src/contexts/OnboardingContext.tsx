
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingContextType {
  profileData: {
    displayName: string;
    avatarUrl: string | null;
    companyId: string | null;
    newCompanyName: string | null;
    companyDetails: any | null;
    interests: string[];
  };
  updateProfileData: (data: Partial<OnboardingContextType['profileData']>) => void;
  saveProfileData: () => Promise<void>;
  isLoading: boolean;
}

const defaultProfileData = {
  displayName: "",
  avatarUrl: null,
  companyId: null,
  newCompanyName: null,
  companyDetails: null,
  interests: []
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserProfile, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [isLoading, setIsLoading] = useState(false);

  const updateProfileData = (data: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const saveProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      console.log("Iniciando salvamento de perfil de onboarding:", profileData);
      
      // Criar empresa se necessário
      let finalCompanyId = profileData.companyId;
      
      if (!finalCompanyId && profileData.newCompanyName) {
        console.log("Criando nova empresa:", profileData.newCompanyName);
        
        const { data: companyData, error: companyError } = await supabase
          .from('empresas')
          .insert([{ 
            nome: profileData.newCompanyName,
            descricao: profileData.companyDetails?.description,
            historia: profileData.companyDetails?.historia,
            missao: profileData.companyDetails?.missao,
            valores: profileData.companyDetails?.valores,
            frase_institucional: profileData.companyDetails?.frase_institucional,
            video_institucional: profileData.companyDetails?.video_institucional,
            descricao_video: profileData.companyDetails?.descricao_video,
            criado_por: user.id,
            admin_id: user.id
          }])
          .select('id')
          .single();
          
        if (companyError) {
          console.error("Erro ao criar empresa:", companyError);
          throw companyError;
        }
        
        console.log("Empresa criada com sucesso:", companyData);
        finalCompanyId = companyData.id;
        
        // Vincular usuário à empresa como admin (criador da empresa)
        const { error: relationError } = await supabase
          .from('user_empresa')
          .insert([{ 
            user_id: user.id,
            empresa_id: finalCompanyId,
            is_admin: true
          }]);
          
        if (relationError) {
          console.error("Erro ao vincular usuário à empresa:", relationError);
          throw relationError;
        }
        
        console.log("Usuário vinculado como admin da empresa");
      } else if (finalCompanyId) {
        console.log("Usando empresa existente:", finalCompanyId);
        
        // Se empresa já existe, verificar se já existe vínculo
        const { data: existingRelation } = await supabase
          .from('user_empresa')
          .select('*')
          .eq('user_id', user.id)
          .eq('empresa_id', finalCompanyId)
          .maybeSingle();
          
        // Se não existe vínculo, criar (sem verificação de admin)
        if (!existingRelation) {
          console.log("Criando novo vínculo para empresa existente");
          
          const { error: relationError } = await supabase
            .from('user_empresa')
            .insert([{ 
              user_id: user.id,
              empresa_id: finalCompanyId,
              is_admin: false // Usuário não é admin por padrão quando se associa a empresa existente
            }]);
            
          if (relationError) {
            console.error("Erro ao vincular usuário à empresa existente:", relationError);
            throw relationError;
          }
          
          console.log("Usuário vinculado como membro da empresa existente");
        } else {
          console.log("Vínculo com empresa já existe:", existingRelation);
        }
      }
      
      // Remover a flag de onboarding_incomplete dos interesses e atualizar primeiro_login
      const cleanInterests = profileData.interests.filter(i => i !== "onboarding_incomplete");
      
      // Dados a atualizar no perfil do usuário
      const profileUpdate = {
        display_name: profileData.displayName,
        avatar: profileData.avatarUrl,
        interesses: cleanInterests,
        primeiro_login: false // Set primeiro_login to false after completing onboarding
      };
      
      console.log("Atualizando perfil do usuário:", profileUpdate);
      
      // Atualizar perfil do usuário no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
        
      if (updateError) {
        console.error("Erro ao atualizar perfil no banco de dados:", updateError);
        throw updateError;
      }
      
      console.log("Perfil atualizado com sucesso no banco de dados");
      
      // Atualizar perfil do usuário no contexto local
      await updateUserProfile(profileUpdate);
      
      // Atualizar estado global
      await updateUserData(profileUpdate);
      
      console.log("Perfil atualizado com sucesso localmente");
      
      // Disparar evento para atualizar relacionamentos de empresa
      window.dispatchEvent(new Event('company-relation-changed'));
      
      // Também forçar recarregamento de empresas
      window.dispatchEvent(new Event('force-reload-companies'));
      
      console.log("Eventos de atualização disparados");
      
      toast.success("Perfil atualizado com sucesso!");
      
      // Redirecionar para a página inicial depois de garantir que os dados foram processados
      setTimeout(() => {
        console.log("Redirecionando para home após onboarding");
        navigate("/", { replace: true });
      }, 500);
      
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Ocorreu um erro ao salvar seu perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: OnboardingContextType = {
    profileData,
    updateProfileData,
    saveProfileData,
    isLoading
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
