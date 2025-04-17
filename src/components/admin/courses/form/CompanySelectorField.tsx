
import React from 'react';
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

interface CompanySelectorFieldProps {
  form: UseFormReturn<CourseFormValues>;
  showCompanySelector: boolean;
}

export const CompanySelectorField: React.FC<CompanySelectorFieldProps> = ({ form, showCompanySelector }) => {
  const { companies, isLoading: isLoadingCompanies } = useCompanies();
  
  if (!showCompanySelector) {
    return null;
  }

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
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                {companies.map((company) => (
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
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
