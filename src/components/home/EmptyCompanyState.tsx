
import React from "react";
import { NoCompaniesAvailable } from "./NoCompaniesAvailable";

interface EmptyCompanyStateProps {
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
  onCompanyCreated: () => void;
  userId?: string;
  forceGetUserCompanies?: (userId: string) => Promise<any>;
}

export const EmptyCompanyState = ({
  showDialog,
  onOpenChange,
  onCompanyTypeSelect,
  onCompanyCreated,
  userId,
  forceGetUserCompanies
}: EmptyCompanyStateProps) => {
  return (
    <div className="min-h-screen bg-background">
      <NoCompaniesAvailable 
        initialDialogState={showDialog}
        onDialogOpenChange={onOpenChange}
        onCompanyTypeSelect={onCompanyTypeSelect}
        onCompanyCreated={onCompanyCreated}
        userId={userId}
        forceGetUserCompanies={forceGetUserCompanies}
      />
    </div>
  );
};
