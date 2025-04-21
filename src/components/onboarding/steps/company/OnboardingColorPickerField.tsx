
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface OnboardingColorPickerFieldProps {
  value: string;
  onChange: (color: string) => void;
}

const predefinedColors = [
  "#1EAEDB", "#9b87f5", "#8B5CF6", "#D946EF", "#F97316",
  "#0EA5E9", "#10B981", "#84CC16", "#3B82F6", "#EC4899",
  "#F2FCE2", "#FEF7CD", "#FEC6A1", "#E5DEFF", "#FFDEE2",
  "#FDE1D3", "#D3E4FD", "#F1F0FB", "#000000", "#403E43",
  "#FFFFFF"
];

const OnboardingColorPickerField: React.FC<OnboardingColorPickerFieldProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{
              backgroundColor: value || "#1EAEDB",
              borderColor: value === "#FFFFFF" ? "#E5E7EB" : value || "#1EAEDB"
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Escolher cor</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer focus:ring-2"
                  style={{
                    backgroundColor: color,
                    borderColor: color === "#FFFFFF" ? "#E5E7EB" : color
                  }}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                />
              ))}
            </div>
            <div className="flex mt-2 gap-2">
              <Input
                type="text"
                placeholder="#RRGGBB"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="flex-1"
                maxLength={7}
                spellCheck={false}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
              <Input
                type="color"
                value={value || "#000000"}
                onChange={e => onChange(e.target.value)}
                className="w-12 h-12 p-1 rounded border"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex-1">
        <Input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={7}
          spellCheck={false}
          className="bg-white"
          pattern="^#[0-9A-Fa-f]{6}$"
          placeholder="#RRGGBB"
        />
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="ml-1"
        onClick={() => setIsOpen(true)}
      >
        <Palette className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default OnboardingColorPickerField;

