
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";

export const useCompanyDialog = () => {
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const { user } = useAuth();
  const { forceGetUserCompanies } = useCompanies();

  const handleCompanyCreated = useCallback(() => {
    setShowCompanyDialog(false);
    if (user?.id) {
      forceGetUserCompanies(user.id);
      toast.success("Company created successfully!");
    }
  }, [user?.id, forceGetUserCompanies]);

  const handleCompanyTypeSelect = useCallback((isExisting: boolean) => {
    console.log("[Index] Company type selected:", isExisting ? "existing" : "new");
  }, []);

  return {
    showCompanyDialog,
    setShowCompanyDialog,
    handleCompanyCreated,
    handleCompanyTypeSelect
  };
};
