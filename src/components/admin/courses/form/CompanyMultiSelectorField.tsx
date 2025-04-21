
import React from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "./CourseFormTypes";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanyMultiSelectorFieldProps {
  form: UseFormReturn<CourseFormValues>;
  companies: { id: string; nome: string; logo?: string }[];
}

export const CompanyMultiSelectorField: React.FC<CompanyMultiSelectorFieldProps> = ({ form, companies }) => {
  const selectedCompanyIds = form.watch("companyIds") || [];

  const toggleCompany = (id: string) => {
    const current = new Set(selectedCompanyIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    form.setValue("companyIds", Array.from(current));
    form.trigger("companyIds");
  };

  return (
    <FormField
      control={form.control}
      name="companyIds"
      render={() => (
        <FormItem>
          <FormLabel>Empresas do Curso</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              {companies.map(company => (
                <label
                  key={company.id}
                  className="inline-flex items-center gap-2 cursor-pointer rounded px-3 py-1 hover:bg-accent transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedCompanyIds.includes(company.id)}
                    onChange={() => toggleCompany(company.id)}
                    className="accent-primary"
                  />
                  {company.logo && (
                    <img src={company.logo} alt={company.nome} className="h-5 w-5 rounded-full object-contain" />
                  )}
                  <span>{company.nome}</span>
                </label>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
