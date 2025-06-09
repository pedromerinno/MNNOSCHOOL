
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyNameSync } from "@/hooks/company/useCompanyNameSync";

export const Footer = () => {
  const { selectedCompany } = useCompanies();
  
  const { displayName } = useCompanyNameSync({ 
    selectedCompany,
    fallbackName: "merinno" 
  });

  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p className="text-gray-400 transition-colors duration-300">{displayName}</p>
      </div>
    </footer>
  );
};
