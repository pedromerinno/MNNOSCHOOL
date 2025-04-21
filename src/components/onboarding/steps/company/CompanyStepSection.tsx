
import React from "react";
import ExistingCompanySection from "./ExistingCompanySection";
import NewCompanySection from "./NewCompanySection";
import type { CompanyDetails } from "./useCompanyStepForm";

interface CompanyStepSectionProps {
  companyType: "existing" | "new";
  companyId: string;
  setCompanyId: (id: string) => void;
  companyInfo: any;
  companyLoading: boolean;
  showCompanyInfo: boolean;
  setShowCompanyInfo: (show: boolean) => void;
  handleCompanyLookup: (info: any, lookupPending: boolean) => void;
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
