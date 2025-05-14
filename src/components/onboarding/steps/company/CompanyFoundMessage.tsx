
import React from "react";
import { Building2 } from "lucide-react";

interface CompanyFoundMessageProps {
  companyName: string;
  logoUrl?: string | null;
}

const CompanyFoundMessage: React.FC<CompanyFoundMessageProps> = ({
  companyName,
  logoUrl
}) => {
  return (
    <div className="mt-4 p-4 border border-emerald-100 rounded-lg bg-emerald-50 flex items-center gap-3 transition-all duration-300 animate-in fade-in">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={companyName}
          className="h-8 w-8 object-contain rounded"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/placeholder.svg";
          }}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-emerald-600" />
        </div>
      )}
      <div>
        <h4 className="font-medium text-emerald-800">Empresa encontrada</h4>
        <p className="text-sm text-emerald-600">{companyName}</p>
      </div>
    </div>
  );
};

export default CompanyFoundMessage;
