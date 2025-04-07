
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { useCompanies } from "@/hooks/useCompanies";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { selectedCompany } = useCompanies();
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-gray-900 flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto px-4">
          © {currentYear} {selectedCompany?.nome || "merinno"}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};
