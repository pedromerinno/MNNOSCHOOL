import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyDetails } from "./hooks/useCompanyDetails";
import { useExistingCompany } from "./hooks/useExistingCompany";
import CompanyStepSection from "./CompanyStepSection";
import CompanyStepError from "./CompanyStepError";
import CompanyStepActions from "./CompanyStepActions";

interface CompanyStepFormProps {
  onNext: () => void;
  onBack: () => void;
  companyType: "existing" | "new";
  onCompanyTypeChange: (type: "existing" | "new") => void;
}

const CompanyStepForm: React.FC<CompanyStepFormProps> = ({
  onNext,
  onBack,
  companyType,
  onCompanyTypeChange
}) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();
  
  // Company ID for existing company option
  const [companyId, setCompanyId] = useState(profileData.companyId || "");
  
  // Company details for new company option
  const { companyDetails, setCompanyDetails } = useCompanyDetails();
  
  // Existing company lookup
  const {
    companyInfo,
    companyLoading,
    showCompanyInfo,
    setShowCompanyInfo,
    handleCompanyLookup
  } = useExistingCompany(companyId);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    console.log("Form submitted with company type:", companyType);
    console.log("Company ID:", companyId);
    console.log("Company details:", companyDetails);

    if (companyType === "existing" && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }
    if (companyType === "new" && !companyDetails.name) {
      setError("Por favor, informe o nome da empresa");
      return;
    }

    setIsSubmitting(true);
    setError("");

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

        console.log("Creating new company", companyDetails);

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

        if (companyError) {
          console.error("Error creating company:", companyError);
          throw companyError;
        }

        console.log("New company created:", newCompany);

        const { error: relationError } = await supabase
          .from("user_empresa")
          .insert({
            user_id: user.id,
            empresa_id: newCompany.id,
            is_admin: true
          });

        if (relationError) {
          console.error("Error creating relation:", relationError);
          throw relationError;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_admin: true,
            interesses: (profileData.interests || []).filter(
              (i) => i !== "onboarding_incomplete"
            )
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          throw profileError;
        }

        toast.success("Empresa criada com sucesso!");
        window.location.href = `/company/${newCompany.id}`;
      } else {
        if (!companyInfo && companyId) {
          await handleCompanyLookup(null, true);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!companyInfo && !companyLoading) {
          setError("Empresa não encontrada com este ID");
          setIsSubmitting(false);
          return;
        }

        console.log("Updating profile data with company ID:", companyId);
        
        updateProfileData({
          companyId,
          newCompanyName: null,
          companyDetails: null
        });
        
        console.log("Navigating to next step");
        onNext();
      }
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error("Erro ao processar operação: " + error.message);
      setError("Erro ao processar operação: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-6">
      <CompanyStepSection
        companyType={companyType}
        companyId={companyId}
        setCompanyId={setCompanyId}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        showCompanyInfo={showCompanyInfo}
        setShowCompanyInfo={setShowCompanyInfo}
        handleCompanyLookup={handleCompanyLookup}
        companyDetails={companyDetails}
        setCompanyDetails={setCompanyDetails}
      />
      
      <CompanyStepError error={error} />
      
      <CompanyStepActions
        companyType={companyType}
        isSubmitting={isSubmitting}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        onBack={onBack}
      />
    </form>
  );
};

export default CompanyStepForm;
