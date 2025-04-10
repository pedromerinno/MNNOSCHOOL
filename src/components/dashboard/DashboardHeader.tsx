
import { useCompanies } from "@/hooks/useCompanies";

export const DashboardHeader = () => {
  const { selectedCompany } = useCompanies();
  
  // Use company color with very low opacity or transparent background
  const headerBgColor = "transparent"; // Changed to transparent
  
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
