
import { useCompanies } from "@/hooks/useCompanies";

export const Footer = () => {
  const { selectedCompany } = useCompanies();

  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p className="text-gray-400">{selectedCompany?.nome || "merinno"}</p>
      </div>
    </footer>
  );
};
