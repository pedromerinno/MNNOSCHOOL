
import React from "react";
import NewCompanyForm from "./NewCompanyForm";
import type { CompanyDetails } from "./useCompanyStepForm";

interface NewCompanySectionProps {
  companyDetails: CompanyDetails;
  setCompanyDetails: (details: CompanyDetails) => void;
}

const NewCompanySection: React.FC<NewCompanySectionProps> = ({
  companyDetails,
  setCompanyDetails
}) => (
  <NewCompanyForm
    companyDetails={companyDetails}
    onCompanyDetailsChange={setCompanyDetails}
  />
);

export default NewCompanySection;
