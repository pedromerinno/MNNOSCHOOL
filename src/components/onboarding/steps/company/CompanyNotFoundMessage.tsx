
import React from "react";
import { Building2 } from "lucide-react";

const CompanyNotFoundMessage: React.FC = () => {
  return (
    <div className="mt-4 p-4 border border-amber-100 rounded-lg bg-amber-50 flex items-center gap-3 transition-all duration-300 animate-in fade-in">
      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
        <Building2 className="h-4 w-4 text-amber-600" />
      </div>
      <div>
        <h4 className="font-medium text-amber-800">Empresa não encontrada</h4>
        <p className="text-sm text-amber-600">
          Verifique o ID informado ou crie uma nova empresa.
        </p>
      </div>
    </div>
  );
};

export default CompanyNotFoundMessage;
