
import { Suspense, lazy } from "react";
import { IndexLoadingState } from "./IndexLoadingState";

const NoCompaniesAvailable = lazy(() => import("@/components/home/NoCompaniesAvailable").then(module => ({ default: module.NoCompaniesAvailable })));

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
      <Suspense fallback={<IndexLoadingState />}>
        <NoCompaniesAvailable />
      </Suspense>
    </div>
  );
};
