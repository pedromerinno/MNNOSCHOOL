
import { AlertTriangle, Users, Building, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanySelectionDialog } from "./CompanySelectionDialog";
import { Card, CardContent } from "@/components/ui/card";

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

      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#191919]">
        <Card className="max-w-md w-full overflow-hidden shadow-lg animate-fade-in">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500"></div>
          
          <CardContent className="pt-6 pb-8 px-6">
            <div className="relative flex justify-center">
              <div className="absolute -top-12 rounded-full bg-white dark:bg-gray-800 p-3 shadow-md">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <h1 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Nenhuma empresa disponível
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Por enquanto não há nenhuma empresa disponível no momento, solicite seu acesso.
              </p>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setShowDialog(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Configurar Acesso
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <Building className="h-4 w-4 mr-2" />
                <span>Crie sua primeira conexão empresarial</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
