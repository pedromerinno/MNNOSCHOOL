
import { useCallback } from "react";
import { toast } from "sonner";

export const useCompanyCallbacks = (
  setShowCompanyDialog: (show: boolean) => void,
  forceGetUserCompanies: (userId: string) => Promise<any>,
  user: any
) => {
  const handleCompanyCreated = useCallback(() => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
      toast.success("Empresa criada com sucesso!");
    }
  }, [setShowCompanyDialog, forceGetUserCompanies, user]);
  
  const handleCompanyTypeSelect = useCallback((isExisting: boolean) => {
    console.log("[Index] Company type selected:", isExisting ? "existing" : "new");
  }, []);

  return {
    handleCompanyCreated,
    handleCompanyTypeSelect
  };
};
