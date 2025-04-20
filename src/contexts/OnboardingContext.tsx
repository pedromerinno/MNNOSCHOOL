
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
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Criar empresa se necessário
      let finalCompanyId = profileData.companyId;
      
      if (!finalCompanyId && profileData.newCompanyName) {
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
          
        if (companyError) throw companyError;
        finalCompanyId = companyData.id;
        
        console.log("Nova empresa criada com ID:", finalCompanyId);
        
        // Adicionar relação entre usuário e empresa com privilégio de admin
        const { error: relationError } = await supabase
          .from('user_empresa')
          .insert([{ 
            user_id: user.id,
            empresa_id: finalCompanyId,
            is_admin: true // Define o usuário como admin da empresa que ele criou
          }]);
          
        if (relationError) throw relationError;
        
        // Atualizar o usuário para ter privilégio admin geral na plataforma
        const { error: adminUpdateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', user.id);
          
        if (adminUpdateError) throw adminUpdateError;
        
      } else if (finalCompanyId) {
        // Verificar se a relação já existe para evitar duplicatas
        const { data: existingRelation, error: checkError } = await supabase
          .from('user_empresa')
          .select('id')
          .eq('user_id', user.id)
          .eq('empresa_id', finalCompanyId)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // Se a relação não existir, criar
        if (!existingRelation) {
          const { error: relationError } = await supabase
            .from('user_empresa')
            .insert([{ 
              user_id: user.id,
              empresa_id: finalCompanyId,
              is_admin: false
            }]);
            
          if (relationError) throw relationError;
        }
      }
      
      // Atualizar perfil do usuário
      const profileUpdate = {
        display_name: profileData.displayName,
        avatar: profileData.avatarUrl,
        interesses: profileData.interests.filter(i => i !== "onboarding_incomplete")
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Atualizar contexto local
      await updateUserProfile(profileUpdate);
      await updateUserData({
        ...profileUpdate,
        is_admin: true // Garantir que o status de admin seja refletido no contexto local
      });
      
      // Disparar evento para atualizar a lista de empresas
      window.dispatchEvent(new Event('company-relation-changed'));
      
      toast.success("Perfil atualizado com sucesso!");
      
      // Forçar recarregamento de empresas antes de redirecionar
      window.dispatchEvent(new Event('force-reload-companies'));
      
      // Pequeno atraso para garantir que os eventos sejam processados
      setTimeout(() => {
        navigate("/"); // Redirecionar para a página inicial
      }, 1500); // Aumentar o tempo de espera para 1.5 segundos
      
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
