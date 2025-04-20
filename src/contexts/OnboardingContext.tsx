
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
  const { user, updateUserProfile } = useAuth();
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
        
        // Vincular usuário à empresa
        await supabase
          .from('user_empresa')
          .insert([{ 
            user_id: user.id,
            empresa_id: finalCompanyId,
            is_admin: true
          }]);
      }
      
      // Atualizar perfil do usuário
      await updateUserProfile({
        display_name: profileData.displayName,
        avatar: profileData.avatarUrl,
        cargo_id: finalCompanyId ? "usuario" : null,
        interesses: profileData.interests.filter(i => i !== "onboarding_incomplete")
      });
      
      toast.success("Perfil atualizado com sucesso!");
      navigate("/");
      
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
