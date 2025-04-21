
import React from "react";
import ExistingCompanyForm from "./ExistingCompanyForm";
import { Skeleton } from "@/components/ui/skeleton";

interface ExistingCompanySectionProps {
  companyId: string;
  setCompanyId: (id: string) => void;
  companyInfo: any;
  companyLoading: boolean;
  showCompanyInfo: boolean;
  setShowCompanyInfo: (show: boolean) => void;
  handleCompanyLookup: (info: any, lookupPending: boolean) => void;
}

const ExistingCompanySection: React.FC<ExistingCompanySectionProps> = ({
  companyId,
  setCompanyId,
  companyInfo,
  companyLoading,
  showCompanyInfo,
  setShowCompanyInfo,
  handleCompanyLookup
}) => (
  <>
    <ExistingCompanyForm
      companyId={companyId}
      onCompanyIdChange={id => {
        setCompanyId(id);
        setShowCompanyInfo(false);
      }}
      onCompanyLookup={handleCompanyLookup}
    />
    {companyLoading ? (
      <div className="flex items-center gap-3 mt-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>
    ) : showCompanyInfo && companyInfo ? (
      <div className="flex items-center gap-4 mt-4 px-3 py-2 border rounded-md bg-gray-50">
        {companyInfo.logo ? (
          <img
            src={companyInfo.logo}
            alt="Logo da empresa"
            className="h-9 w-9 rounded-full bg-gray-200 object-contain"
          />
        ) : (
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-200 font-bold text-lg text-gray-500">
            {companyInfo.nome ? companyInfo.nome.charAt(0) : "?"}
          </span>
        )}
        <span className="font-semibold text-gray-800">{companyInfo.nome}</span>
      </div>
    ) : showCompanyInfo && !companyInfo && !companyLoading && (
      <div className="mt-4 px-3 py-2 border rounded-md bg-gray-50 text-gray-500 text-sm">
        Empresa não encontrada.
      </div>
    )}
  </>
);

export default ExistingCompanySection;
