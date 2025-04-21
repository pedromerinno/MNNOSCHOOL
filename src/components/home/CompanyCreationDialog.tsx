
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

interface CompanyCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

export const CompanyCreationDialog = ({
  open,
  onOpenChange,
  onCompanyCreated,
  onCompanyTypeSelect
}: CompanyCreationDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl p-0 h-[90vh] overflow-hidden flex flex-col">
      <DialogTitle className="sr-only">Configuration of Company</DialogTitle>
      <div className="bg-white rounded-t-lg flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <OnboardingProvider>
            <CompanyStep 
              onNext={() => {
                console.log("[Index] CompanyStep onNext called");
                onOpenChange(false);
                onCompanyCreated();
              }}
              onBack={() => onOpenChange(false)}
              onCompanyTypeSelect={onCompanyTypeSelect}
              onCompanyCreated={onCompanyCreated}
            />
          </OnboardingProvider>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
