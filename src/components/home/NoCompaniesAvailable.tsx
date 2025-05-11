
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const NoCompaniesAvailable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { forceGetUserCompanies, user } = useCompanies();

  const handleCompanyCreated = () => {
    setShowDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
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
        <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3" />
          
          <CardHeader className="pt-8 pb-4 text-center">
            <div className="mx-auto bg-amber-100 rounded-full p-4 mb-4 inline-flex">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Nenhuma empresa disponível</CardTitle>
            <CardDescription className="text-base mt-2">
              Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center pb-0">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all px-6 py-5 rounded-full shadow"
              onClick={() => setShowDialog(true)}
            >
              Configurar Acesso
            </Button>
          </CardContent>
          
          <CardFooter className="text-center text-xs text-gray-500 pt-8 pb-6">
            Crie sua primeira conexão para começar
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
