
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "./CourseFormTypes";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

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
            <div className="flex flex-wrap gap-2 mt-1">
              {companies.map(company => {
                const selected = selectedCompanyIds.includes(company.id);
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => toggleCompany(company.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border transition-all 
                      ${selected 
                        ? "bg-black text-white border-black shadow" 
                        : "bg-muted text-foreground border-muted"
                      }
                      hover:shadow-md focus:outline-none`}
                    style={{ minWidth: 0, fontWeight: selected ? 600 : 500 }}
                    aria-pressed={selected}
                  >
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.nome}
                        className="h-5 w-5 rounded-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                          target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                        {company.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate max-w-[110px]">{company.nome}</span>
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
