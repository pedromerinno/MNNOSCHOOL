
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { useCompanies } from "@/hooks/useCompanies";
import { AdminFloatingActionButton } from "../admin/AdminFloatingActionButton";

interface DashboardLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export const DashboardLayout = ({ children, fullWidth = false }: DashboardLayoutProps) => {
  const { selectedCompany } = useCompanies();
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919] flex flex-col">
      <DashboardHeader />
      <main className="flex-1">
        <div className={fullWidth ? "w-full" : "container mx-auto px-4 lg:px-8"}>
          {children}
        </div>
      </main>
      <footer className="py-16 text-center text-sm text-gray-500">
        <div className="container mx-auto px-8">
          © {currentYear} {selectedCompany?.nome || "merinno"}. Todos os direitos reservados.
        </div>
      </footer>
      <AdminFloatingActionButton />
    </div>
  );
};
