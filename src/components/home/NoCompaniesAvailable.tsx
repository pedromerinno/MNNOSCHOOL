
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CompanyStep from "@/components/onboarding/steps/CompanyStep";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export const NoCompaniesAvailable = () => {
  const [showCompanyDialog, setShowCompanyDialog] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCompanyCreated = () => {
    setShowCompanyDialog(false);
    navigate('/', { replace: true });
  };

  const handleRequestAccess = () => {
    const subject = encodeURIComponent("Solicitação de Acesso à Plataforma");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar acesso à plataforma Merinno.\n\nInformações do usuário:\nEmail: ${user?.email || "Não disponível"}\n\nAtenciosamente,\n${user?.email?.split('@')[0] || "Usuário"}`
    );
    
    window.location.href = `mailto:suporte@merinno.com?subject=${subject}&body=${body}`;
    
    toast.success("Redirecionando para seu cliente de email", {
      description: "Preencha os detalhes adicionais necessários e envie o email para solicitar acesso.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
        <DialogContent className="max-w-4xl p-0">
          <div className="bg-white rounded-3xl">
            <div className="p-16">
              <OnboardingProvider>
                <CompanyStep 
                  onNext={() => {}} 
                  onBack={() => setShowCompanyDialog(false)}
                  onCompanyTypeSelect={() => {}}
                  onCompanyCreated={handleCompanyCreated}
                />
              </OnboardingProvider>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Nenhuma empresa disponível
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="default" 
            className="bg-black hover:bg-black/80 text-white"
            onClick={() => setShowCompanyDialog(true)}
          >
            Vincular Empresa
          </Button>
          
          <Button 
            variant="outline" 
            className="border-black hover:bg-black/5"
            onClick={handleRequestAccess}
          >
            Solicitar acesso
          </Button>
        </div>
      </div>
    </div>
  );
};
