import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { toast } from "sonner";
import { UserHome } from "./UserHome";

export const NoCompaniesAvailable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const {
    forceGetUserCompanies,
    selectCompany,
    user,
    userCompanies,
    selectedCompany
  } = useCompanies();
  
  const [attemptedSelection, setAttemptedSelection] = useState(false);
  const [contentKey, setContentKey] = useState(Date.now());

  // Effect for selecting the first company when available
  useEffect(() => {
    if (user?.id && userCompanies.length > 0 && !selectedCompany && !attemptedSelection) {
      console.log("[NoCompaniesAvailable] Empresas disponíveis:", userCompanies.length);
      setAttemptedSelection(true);
      
      try {
        // Attempt to select the first company automatically
        selectCompany(user.id, userCompanies[0]);
        toast.success(`Empresa ${userCompanies[0].nome} selecionada automaticamente`);
        
        // Dispatch an event to notify other components
        const event = new CustomEvent('company-selected', {
          detail: {
            userId: user.id,
            company: userCompanies[0]
          }
        });
        window.dispatchEvent(event);
        
        // Force update interface with a delay
        setTimeout(() => {
          window.dispatchEvent(new Event('force-reload-companies'));
          
          // Dispatch additional event for component-specific updates
          window.dispatchEvent(new CustomEvent('company-changed', {
            detail: { company: userCompanies[0] }
          }));
          
          setContentKey(Date.now());
        }, 500);
      } catch (error) {
        console.error("[NoCompaniesAvailable] Erro ao selecionar empresa:", error);
        toast.error("Erro ao selecionar empresa. Tente novamente.");
      }
    }
  }, [user, userCompanies, selectCompany, selectedCompany, attemptedSelection]);
  
  const handleCompanyCreated = () => {
    setShowDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id).then(companies => {
        if (companies.length > 0) {
          toast.success("Empresa criada e selecionada com sucesso!");
          
          // Auto-select after creation
          selectCompany(user.id, companies[0]);
          
          // Force interface update
          setTimeout(() => {
            window.dispatchEvent(new Event('force-reload-companies'));
            setContentKey(Date.now());
          }, 500);
        }
      });
    }
  };
  
  const handleCompanyTypeSelect = (isExisting: boolean) => {
    console.log("[NoCompaniesAvailable] Company type selected:", isExisting ? "existing" : "new");
  };
  
  // If companies are available and one is selected, show the home content
  if (userCompanies.length > 0 && selectedCompany) {
    console.log("[NoCompaniesAvailable] Company is selected, rendering UserHome");
    return <UserHome key={contentKey} />;
  }

  // Otherwise show the "no companies available" view
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
