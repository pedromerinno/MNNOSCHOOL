import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoticeFormData } from "@/hooks/useCompanyNotices";

interface NoticeFormFieldsProps {
  form: UseFormReturn<NoticeFormData>;
}

export const NoticeFormFields: React.FC<NoticeFormFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título do Aviso</FormLabel>
            <FormControl>
              <Input placeholder="Digite o título do aviso" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Conteúdo</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Digite o conteúdo do aviso" 
                {...field} 
                rows={6}
                className="resize-none"
                value={field.value || ""} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="informativo">Informativo</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="padrão">Padrão</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="data_inicio"
        render={({ field }) => {
          const formatForInput = (isoString: string | null | undefined): string => {
            if (!isoString) return "";
            try {
              const date = new Date(isoString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch {
              return "";
            }
          };

          return (
            <FormItem>
              <FormLabel>Data de Início (Agendamento)</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  value={formatForInput(field.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      // datetime-local retorna no formato YYYY-MM-DDTHH:mm (timezone local)
                      // Converter para ISO string preservando o horário local
                      const date = new Date(value);
                      field.onChange(date.toISOString());
                    } else {
                      field.onChange(null);
                    }
                  }}
                  placeholder="Selecione a data e hora de início"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="data_fim"
        render={({ field }) => {
          const formatForInput = (isoString: string | null | undefined): string => {
            if (!isoString) return "";
            try {
              const date = new Date(isoString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch {
              return "";
            }
          };

          return (
            <FormItem>
              <FormLabel>Data de Término (Tirar Visibilidade)</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local"
                  value={formatForInput(field.value)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      // datetime-local retorna no formato YYYY-MM-DDTHH:mm (timezone local)
                      // Converter para ISO string preservando o horário local
                      const date = new Date(value);
                      field.onChange(date.toISOString());
                    } else {
                      field.onChange(null);
                    }
                  }}
                  placeholder="Selecione a data e hora de término"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </>
  );
};
