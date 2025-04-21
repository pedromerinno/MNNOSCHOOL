
import React from "react";
import CompanyTypeSelector from "./CompanyTypeSelector";

interface CompanyStepHeaderProps {
  companyType: "existing" | "new";
  onTypeChange: (type: "existing" | "new") => void;
}

const CompanyStepHeader: React.FC<CompanyStepHeaderProps> = ({
  companyType,
  onTypeChange,
}) => (
  <CompanyTypeSelector
    companyType={companyType}
    onTypeChange={onTypeChange}
  />
);

export default CompanyStepHeader;
