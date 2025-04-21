
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";

export const CompanyRegistrationForm = () => {
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();
  
  const handleCompanyCreated = async () => {
    toast.success("Empresa criada com sucesso!");
    
    if (user?.id) {
      console.log("[Index] Empresa criada, forçando recarregamento de empresas");
      await forceGetUserCompanies(user.id);
    }
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
