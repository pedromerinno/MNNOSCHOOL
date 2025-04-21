
import { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import type { ValueItem } from "../NewCompanyValuesField";

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

export function useCompanyDetails() {
  const { profileData } = useOnboarding();

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

  return { companyDetails, setCompanyDetails };
}
