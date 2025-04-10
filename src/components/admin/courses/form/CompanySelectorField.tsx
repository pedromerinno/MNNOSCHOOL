
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "./CourseFormTypes";
import { useCompanies } from '@/hooks/useCompanies';

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
            <select
              className="w-full p-2 border rounded-md"
              {...field}
              disabled={isLoadingCompanies}
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.nome}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
