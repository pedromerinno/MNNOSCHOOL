
import React, { useState } from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export interface ColorPickerFieldProps {
  control: Control<any>;
  name: string;
  label: string;
}

const predefinedColors = [
  "#1EAEDB", "#0FA0CE", "#33C3F0", "#8B5CF6", "#D946EF", 
  "#F97316", "#0EA5E9", "#10B981", "#84CC16", "#3B82F6", 
  "#EC4899", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563",
  "#374151", "#1F2937", "#111827", "#000000", "#FFFFFF"
];

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  control,
  name,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-10 h-10 p-0 border-2"
                  style={{ 
                    backgroundColor: field.value || "#1EAEDB",
                    borderColor: field.value === "#FFFFFF" ? "#E5E7EB" : field.value || "#1EAEDB" 
                  }}
                >
                  <span className="sr-only">Escolher cor</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                        style={{ 
                          backgroundColor: color,
                          borderColor: color === "#FFFFFF" ? "#E5E7EB" : color
                        }}
                        onClick={() => {
                          field.onChange(color);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <Input
                      type="text"
                      placeholder="#RRGGBB"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <FormControl>
              <div className="flex-1 relative">
                <Input 
                  type="text" 
                  {...field} 
                  placeholder="#RRGGBB"
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setIsOpen(true)}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
