
import { useCompanies } from "@/hooks/useCompanies";

export const DashboardHeader = () => {
  const { selectedCompany } = useCompanies();
  
  // Pegamos a cor da empresa ou usamos o azul padrão
  const headerBgColor = selectedCompany?.cor_principal 
    ? `${selectedCompany.cor_principal}10` // 10 é a opacidade em hex (6%)
    : "rgba(30, 174, 219, 0.06)"; // Azul padrão com opacidade baixa
  
  return (
    <div 
      className="container mx-auto px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-background"
      style={{ 
        backgroundColor: headerBgColor 
      }}
    >
      <div className="flex items-center justify-end">
        {/* Empty container for potential future elements */}
      </div>
    </div>
  );
};
