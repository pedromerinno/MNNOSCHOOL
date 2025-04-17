
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompanySelectorFieldProps {
  form: UseFormReturn<CourseFormValues>;
  showCompanySelector: boolean;
}

export const CompanySelectorField: React.FC<CompanySelectorFieldProps> = ({ form, showCompanySelector }) => {
  const { companies, userCompanies, isLoading: isLoadingCompanies, forceGetUserCompanies, user } = useCompanies();
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  
  // Force reload companies when component mounts
  useEffect(() => {
    if (user?.id && showCompanySelector && !hasTriedFetch) {
      console.log("CompanySelectorField: Forcing reload of user companies for user:", user.id);
      forceGetUserCompanies(user.id);
      setHasTriedFetch(true);
      
      // For debugging: Dispatch an event to force reload companies globally
      window.dispatchEvent(new CustomEvent('force-reload-companies'));
    }
  }, [user?.id, forceGetUserCompanies, showCompanySelector, hasTriedFetch]);
  
  // Notify the user if loading takes too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoadingCompanies && showCompanySelector) {
      timeoutId = setTimeout(() => {
        toast.info("Buscando empresas disponíveis...", {
          id: "loading-companies"
        });
      }, 2000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoadingCompanies, showCompanySelector]);
  
  if (!showCompanySelector) {
    return null;
  }

  // Use userCompanies instead of companies to show only companies the user has access to
  const availableCompanies = userCompanies.length > 0 ? userCompanies : companies;
  
  // Debug output to help diagnose issues
  console.log("CompanySelectorField: Available companies:", availableCompanies);
  console.log("CompanySelectorField: Is loading:", isLoadingCompanies);
  console.log("CompanySelectorField: Has tried fetch:", hasTriedFetch);

  return (
    <FormField
      control={form.control}
      name="companyId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Empresa</FormLabel>
          <FormControl>
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
