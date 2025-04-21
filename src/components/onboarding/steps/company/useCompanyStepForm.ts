
import { useState, useEffect, useCallback } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ValueItem } from "./NewCompanyValuesField";

export type CompanyType = "existing" | "new";

export interface CompanyDetails {
  name: string;
  logo?: string;
  frase_institucional: string;
  cor_principal: string;
  missao: string;
  valores: ValueItem[];
  video_institucional: string;
  descricao_video: string;
  historia: string;
}

export const useCompanyStepForm = (
  onNext: () => void,
  onBack: () => void,
  onCompanyTypeSelect: (isExisting: boolean) => void
) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();

  const [companyType, setCompanyType] = useState<CompanyType>(
    profileData.companyId ? "existing" : "new"
  );
  const [companyId, setCompanyId] = useState(profileData.companyId || "");
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: profileData.newCompanyName || "",
    logo: "",
    historia: "",
    missao: "",
    valores: [],
    frase_institucional: "",
    video_institucional: "",
    descricao_video: "",
    cor_principal: "#000000"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { companyInfo, loading: companyLoading, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  useEffect(() => {
    onCompanyTypeSelect(companyType === "existing");
  }, [companyType, onCompanyTypeSelect]);

  const handleCompanyLookup = useCallback(
    async (info: any, lookupPending: boolean) => {
      setShowCompanyInfo(false);
      if (companyId && companyId.length >= 10) {
        await fetchCompany(companyId);
        setShowCompanyInfo(true);
      }
    },
    [companyId, fetchCompany]
  );

  useEffect(() => {
    if (
      companyType === "existing" &&
      companyInfo &&
      showCompanyInfo &&
      !isSubmitting
    ) {
      setError("");
    }
  }, [companyInfo, showCompanyInfo, companyType, isSubmitting]);

  const handleCompanyTypeChange = (type: CompanyType) => {
    setCompanyType(type);
    setError("");
    setShowCompanyInfo(false);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (companyType === "existing" && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }

    if (companyType === "new" && !companyDetails.name) {
      setError("Por favor, informe o nome da empresa");
      return;
    }

    setIsSubmitting(true);

    try {
      if (companyType === "new") {
        if (!user) {
          toast.error("Usuário não autenticado");
          setIsSubmitting(false);
          return;
        }

        const formattedValues = Array.isArray(companyDetails.valores)
          ? JSON.stringify(companyDetails.valores)
          : companyDetails.valores;

        const { data: newCompany, error: companyError } = await supabase
          .from("empresas")
          .insert({
            nome: companyDetails.name,
            logo: companyDetails.logo,
            historia: companyDetails.historia,
            missao: companyDetails.missao,
            valores: formattedValues,
            frase_institucional: companyDetails.frase_institucional,
            video_institucional: companyDetails.video_institucional,
            descricao_video: companyDetails.descricao_video,
            cor_principal: companyDetails.cor_principal
          })
          .select()
          .single();

        if (companyError) throw companyError;

        const { error: relationError } = await supabase
          .from("user_empresa")
          .insert({
            user_id: user.id,
            empresa_id: newCompany.id,
            is_admin: true
          });

        if (relationError) throw relationError;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_admin: true,
            interesses: (profileData.interests || []).filter(
              (i) => i !== "onboarding_incomplete"
            )
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        toast.success("Empresa criada com sucesso!");
        window.location.href = `/company/${newCompany.id}`;
      } else {
        if (!companyInfo && companyId) {
          await fetchCompany(companyId);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!companyInfo && !companyLoading) {
          setError("Empresa não encontrada com este ID");
          setIsSubmitting(false);
          return;
        }

        updateProfileData({
          companyId,
          newCompanyName: null,
          companyDetails: null
        });
        onCompanyTypeSelect(true);
        onNext();
      }
    } catch (error: any) {
      toast.error("Erro ao processar operação: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    companyType,
    setCompanyType,
    companyId,
    setCompanyId,
    companyDetails,
    setCompanyDetails,
    error,
    setError,
    isSubmitting,
    handleInitialSubmit,
    companyInfo,
    companyLoading,
    showCompanyInfo,
    setShowCompanyInfo,
    handleCompanyLookup,
    handleCompanyTypeChange,
    onBack
  };
};
