
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
  const { members = [], isLoading = false } = useTeamMembers();

  // Safely ensure we have valid arrays and objects
  const memberNames = React.useMemo(() => {
    if (!Array.isArray(members)) return [];
    
    try {
      return members
        .filter(member => member && typeof member === 'object' && member.display_name)
        .map(member => member.display_name || '')
        .filter(name => typeof name === 'string' && name.trim() !== '');
    } catch (error) {
      console.error("Error processing member names:", error);
      return [];
    }
  }, [members]);

  // Safely create options array
  const allOptions = React.useMemo(() => {
    try {
      // Start with validated member names
      const baseOptions = [...memberNames];
      
      // Only add input value if it's valid
      if (inputValue && typeof inputValue === 'string' && inputValue.trim() !== '') {
        const inputValueTrimmed = inputValue.trim();
        if (!baseOptions.includes(inputValueTrimmed)) {
          baseOptions.push(inputValueTrimmed);
        }
      }
      
      return baseOptions;
    } catch (error) {
      console.error("Error creating options list:", error);
      return [];
    }
  }, [memberNames, inputValue]);

  // Safely filter options
  const filteredOptions = React.useMemo(() => {
    try {
      if (!inputValue || !inputValue.trim()) return allOptions;
      
      const searchTerm = inputValue.toLowerCase().trim();
      return allOptions.filter(option => 
        typeof option === 'string' && option.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Error filtering options:", error);
      return [];
    }
  }, [allOptions, inputValue]);

  // Show loading state
  if (isLoading) {
    return (
      <FormField
        control={form.control}
        name="instructor"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Instrutor</FormLabel>
            <FormControl>
              <Button
                variant="outline"
                disabled={true}
                className="justify-between"
              >
                Carregando instrutores...
              </Button>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

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
                  {inputValue && inputValue.trim() ? 
                    <div 
                      className="cursor-pointer px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        const trimmed = inputValue.trim();
                        if (trimmed) {
                          form.setValue("instructor", trimmed);
                          setOpen(false);
                        }
                      }}
                    >
                      Usar "{inputValue.trim()}" como instrutor
                    </div> : 
                    "Nenhum instrutor encontrado"
                  }
                </CommandEmpty>
                
                {filteredOptions && filteredOptions.length > 0 && (
                  <CommandGroup>
                    {filteredOptions.map((name, index) => (
                      <CommandItem
                        key={`${name}-${index}`}
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
