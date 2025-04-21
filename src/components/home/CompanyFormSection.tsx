
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { toast } from "sonner";

interface CompanyFormSectionProps {
  onCompanyCreated: () => Promise<void>;
}

export const CompanyFormSection = ({ onCompanyCreated }: CompanyFormSectionProps) => {
  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    await onCompanyCreated();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Cadastrar Empresa</h1>
        <CompanyStep 
          onNext={() => {}} 
          onBack={() => {}} 
          onCompanyTypeSelect={() => {}} 
          onCompanyCreated={handleCompanyCreated}
          hideBack={true}
        />
      </div>
    </div>
  );
};
