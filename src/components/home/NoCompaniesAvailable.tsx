
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { toast } from "sonner";

export const NoCompaniesAvailable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const {
    forceGetUserCompanies,
    user,
    userCompanies,
    selectCompany
  } = useCompanies();

  // Effect para selecionar a primeira empresa quando disponível
  useEffect(() => {
    if (user?.id && userCompanies.length > 0 && !showDialog) {
      console.log("[NoCompaniesAvailable] Empresas disponíveis:", userCompanies.length);
      try {
        // Tentativa de selecionar a primeira empresa automaticamente
        selectCompany(user.id, userCompanies[0]);
        toast.success(`Empresa ${userCompanies[0].nome} selecionada automaticamente`);
        
        // Disparar um evento para notificar outros componentes
        const event = new CustomEvent('company-selected', {
          detail: {
            company: userCompanies[0]
          }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("[NoCompaniesAvailable] Erro ao selecionar empresa:", error);
      }
    }
  }, [user, userCompanies, selectCompany, showDialog]);
  
  const handleCompanyCreated = () => {
    setShowDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id).then(companies => {
        if (companies.length > 0) {
          toast.success("Empresa criada e selecionada com sucesso!");
        }
      });
    }
  };
  
  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[NoCompaniesAvailable] Company type selected:", isExisting ? "existing" : "new");
  };
  
  return (
    <>
      <CompanySelectionDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        onCompanyTypeSelect={handleCompanyTypeSelect} 
        onCompanyCreated={handleCompanyCreated} 
        userId={user?.id} 
        forceGetUserCompanies={forceGetUserCompanies} 
      />

      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-sm w-full mx-auto bg-card border border-border rounded-lg p-6 shadow-sm animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-xl font-medium text-center mb-3 text-foreground">
            Nenhuma empresa disponível
          </h1>
          
          <p className="text-sm text-center text-muted-foreground mb-6">
            Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
          </p>
          
          <div className="flex justify-center my-[10px]">
            <Button variant="outline" size="sm" className="hover:bg-accent transition-colors" onClick={() => setShowDialog(true)}>
              Configurar Acesso
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
