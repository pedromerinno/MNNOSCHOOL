
import React from "react";
import ExistingCompanySection from "./ExistingCompanySection";
import NewCompanySection from "./NewCompanySection";
import type { CompanyDetails } from "./useCompanyStepForm";
import type { Company } from "@/types/company";

interface CompanyInfo {
  id: string;
  nome: string;
  logo?: string | null;
}

interface CompanyStepSectionProps {
  companyType: "existing" | "new";
  companyId: string;
  setCompanyId: (id: string) => void;
  companyInfo: Company | null;
  companyLoading: boolean;
  showCompanyInfo: boolean;
  setShowCompanyInfo: (show: boolean) => void;
  handleCompanyLookup: (info: CompanyInfo | null, lookupPending: boolean) => Promise<void>;
  companyDetails: CompanyDetails;
  setCompanyDetails: (details: CompanyDetails) => void;
}

const CompanyStepSection: React.FC<CompanyStepSectionProps> = ({
  companyType,
  companyId,
  setCompanyId,
  companyInfo,
  companyLoading,
  showCompanyInfo,
  setShowCompanyInfo,
  handleCompanyLookup,
  companyDetails,
  setCompanyDetails,
}) => (
  <>
    {companyType === "existing" ? (
      <ExistingCompanySection
        companyId={companyId}
        setCompanyId={setCompanyId}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        showCompanyInfo={showCompanyInfo}
        setShowCompanyInfo={setShowCompanyInfo}
        handleCompanyLookup={handleCompanyLookup}
      />
    ) : (
      <NewCompanySection
        companyDetails={companyDetails}
        setCompanyDetails={setCompanyDetails}
      />
    )}
  </>
);

export default CompanyStepSection;
