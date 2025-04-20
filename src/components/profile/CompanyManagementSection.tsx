
import { AlertTriangle, Building, X } from "lucide-react";
import { Company } from "@/types/company";
import { useCompanyUserManagement } from "@/hooks/company/useCompanyUserManagement";
import { useCompanies } from "@/hooks/useCompanies";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyManagementSectionProps {
  userCompanies: Company[];
}

export const CompanyManagementSection = ({ userCompanies }: CompanyManagementSectionProps) => {
  const [companyToRemove, setCompanyToRemove] = useState<Company | null>(null);
  const { removeUserFromCompany } = useCompanyUserManagement();
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();
  
  const handleUnlinkCompany = async () => {
    if (!companyToRemove || !user?.id) return;
    
    await removeUserFromCompany(user.id, companyToRemove.id);
    setCompanyToRemove(null);
    
    // Refresh companies list
    if (user?.id) {
      await forceGetUserCompanies(user.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-4 w-4" />
        <h3 className="text-sm font-medium">Empresas Vinculadas</h3>
      </div>
      
      {userCompanies.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Você não está vinculado a nenhuma empresa.
        </p>
      ) : (
        <div className="space-y-2">
          {userCompanies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.nome}
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                )}
                <span className="text-sm font-medium">{company.nome}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCompanyToRemove(company)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!companyToRemove} onOpenChange={() => setCompanyToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Desvincular empresa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja se desvincular da empresa {companyToRemove?.nome}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
