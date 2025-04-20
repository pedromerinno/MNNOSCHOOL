
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
      // Criar empresa se necessário
      let finalCompanyId = profileData.companyId;
      
      if (!finalCompanyId && profileData.newCompanyName) {
        const { data: companyData, error: companyError } = await supabase
          .from('empresas')
          .insert([{ 
            nome: profileData.newCompanyName,
            criado_por: user.id,
            admin_id: user.id
          }])
          .select('id')
          .single();
          
        if (companyError) throw companyError;
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
      } else if (finalCompanyId) {
        // Se empresa já existe, verificar se já existe vínculo
        const { data: existingRelation } = await supabase
          .from('user_empresa')
          .select('*')
          .eq('user_id', user.id)
          .eq('empresa_id', finalCompanyId)
          .single();
          
        // Se não existe vínculo, criar (sem verificação de admin)
        if (!existingRelation) {
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
        }
      }
      
      // Dados a atualizar no perfil do usuário
      const profileUpdate = {
        display_name: profileData.displayName,
        avatar: profileData.avatarUrl,
        cargo_id: null, // removendo a configuração de "usuario" que causava erro
        interesses: profileData.interests.filter(i => i !== "onboarding_incomplete")
      };
      
      // Atualizar perfil do usuário no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
        
      if (updateError) {
        console.error("Erro ao atualizar perfil no banco de dados:", updateError);
        throw updateError;
      }
      
      // Atualizar perfil do usuário no contexto local
      await updateUserProfile(profileUpdate);
      
      // Atualizar estado global
      await updateUserData(profileUpdate);
      
      // Disparar evento para atualizar relacionamentos de empresa
      window.dispatchEvent(new Event('company-relation-changed'));
      
      toast.success("Perfil atualizado com sucesso!");
      navigate("/"); // Navigate to home page after successful update
      
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
