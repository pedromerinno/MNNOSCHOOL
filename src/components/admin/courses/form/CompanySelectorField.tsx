
import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "./CourseFormTypes";
import { useCompanies } from '@/hooks/useCompanies';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompanySelectorFieldProps {
  form: UseFormReturn<CourseFormValues>;
  showCompanySelector: boolean;
}

export const CompanySelectorField: React.FC<CompanySelectorFieldProps> = ({ form, showCompanySelector }) => {
  const { companies, userCompanies, isLoading: isLoadingCompanies, forceGetUserCompanies, user, error } = useCompanies();
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Force reload companies when component mounts or when retry is triggered
  useEffect(() => {
    if (user?.id && showCompanySelector && (!hasTriedFetch || retryCount > 0)) {
      console.log(`CompanySelectorField: Forcing reload of user companies for user: ${user.id}, retry: ${retryCount}`);
      forceGetUserCompanies(user.id).catch(err => {
        console.error("Error in forced company fetch:", err);
      });
      setHasTriedFetch(true);
    }
  }, [user?.id, forceGetUserCompanies, showCompanySelector, hasTriedFetch, retryCount]);
  
  // Notify the user if loading takes too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoadingCompanies && showCompanySelector) {
      timeoutId = setTimeout(() => {
        toast.info("Buscando empresas disponíveis...", {
          id: "loading-companies"
        });
      }, 1500); // Reduced to improve user experience
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoadingCompanies, showCompanySelector]);
  
  const handleRetry = () => {
    toast.info("Tentando novamente...");
    setRetryCount(prev => prev + 1);
  };
  
  if (!showCompanySelector) {
    return null;
  }

  // Use userCompanies instead of companies to show only companies the user has access to
  const availableCompanies = userCompanies.length > 0 ? userCompanies : companies;
  
  // Debug output to help diagnose issues
  console.log("CompanySelectorField: Available companies:", availableCompanies.length);
  console.log("CompanySelectorField: Is loading:", isLoadingCompanies);
  console.log("CompanySelectorField: Has tried fetch:", hasTriedFetch);
  console.log("CompanySelectorField: Retry count:", retryCount);
  console.log("CompanySelectorField: Error:", error?.message);

  return (
    <FormField
      control={form.control}
      name="companyId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Empresa</FormLabel>
          <FormControl>
            {error ? (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Erro ao carregar empresas: {error.message || "Falha na conexão"}
                  </AlertDescription>
                </Alert>
                <button 
                  type="button" 
                  onClick={handleRetry}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <Select
                disabled={isLoadingCompanies}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className="w-full bg-white">
                  {isLoadingCompanies ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </div>
                  ) : (
                    <SelectValue placeholder="Selecione uma empresa" />
                  )}
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  {availableCompanies.length === 0 && !isLoadingCompanies ? (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      Nenhuma empresa disponível
                    </div>
                  ) : (
                    availableCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="cursor-pointer">
                        <div className="flex items-center">
                          {company.logo && (
                            <img
                              src={company.logo}
                              alt={company.nome}
                              className="h-4 w-4 mr-2 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                                target.onerror = null;
                              }}
                            />
                          )}
                          {company.nome}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
