
import React from "react";

interface CompanyStepErrorProps {
  error: string;
}

const CompanyStepError: React.FC<CompanyStepErrorProps> = ({ error }) =>
  error ? (
    <p className="text-red-500 text-sm mt-2">{error}</p>
  ) : null;

export default CompanyStepError;
