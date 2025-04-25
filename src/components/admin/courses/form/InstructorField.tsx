
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { CourseFormValues } from "./CourseFormTypes";

interface InstructorFieldProps {
  form: UseFormReturn<CourseFormValues>;
}

export const InstructorField: React.FC<InstructorFieldProps> = ({ form }) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const { members } = useTeamMembers();

  // Garantir que estamos trabalhando com arrays válidos
  const memberNames = React.useMemo(() => {
    if (!members || members.length === 0) return [];
    return members
      .filter(member => member && member.display_name)
      .map(member => member.display_name || '')
      .filter(Boolean);
  }, [members]);

  // Criar opções combinadas garantindo que são arrays válidos
  const allOptions = React.useMemo(() => {
    const options = [...new Set([...(memberNames || []), inputValue])];
    return options.filter(Boolean);
  }, [memberNames, inputValue]);

  return (
    <FormField
      control={form.control}
      name="instructor"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Instrutor</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between"
                >
                  {field.value || "Selecione o instrutor"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput 
                  placeholder="Busque um instrutor..." 
                  value={inputValue}
                  onValueChange={(value) => {
                    setInputValue(value || "");
                  }}
                />
                <CommandEmpty>
                  {inputValue ? 
                    <div 
                      className="cursor-pointer px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        if (inputValue) {
                          form.setValue("instructor", inputValue);
                          setOpen(false);
                        }
                      }}
                    >
                      Usar "{inputValue}" como instrutor
                    </div> : 
                    "Nenhum instrutor encontrado"
                  }
                </CommandEmpty>
                {allOptions.length > 0 && (
                  <CommandGroup>
                    {allOptions.map((name) => (
                      <CommandItem
                        key={name}
                        value={name}
                        onSelect={() => {
                          form.setValue("instructor", name);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
