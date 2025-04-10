
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";

export const SearchBar = () => {
  const { selectedCompany } = useCompanies();
  
  // Use a cor principal da empresa, ou um azul padrão
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  return (
    <div className="relative w-64">
      <div className={cn(
        "flex items-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 hover:border-gray-300 dark:hover:border-gray-600 transition-all",
        "focus-within:ring-2 focus-within:ring-offset-0",
        "focus-within:ring-opacity-50"
      )}
      style={{ 
        "--tw-ring-color": `${companyColor}40` // 40 é a opacidade em hex (25%)
      } as React.CSSProperties}
      >
        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
        <Input
          placeholder="Pesquisar..."
          className="border-0 bg-transparent p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
      </div>
    </div>
  );
};
