
import { useCompanyContext } from "@/contexts/CompanyContext";

export const useCurrentCompany = () => {
  const companyContext = useCompanyContext();
  
  return {
    ...companyContext,
    isCompanySelected: !!companyContext.selectedCompany,
    companyId: companyContext.selectedCompany?.id || null,
    companyName: companyContext.selectedCompany?.nome || null,
    companyColor: companyContext.selectedCompany?.cor_principal || "#000000",
    companyLogo: companyContext.selectedCompany?.logo || null
  };
};
