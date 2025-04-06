
import { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background custom-cursor-area flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} MERINNO. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};
