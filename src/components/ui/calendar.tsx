
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useCompanies } from "@/hooks/useCompanies";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#000000"; // black default
  
  // Convert hex to RGB for CSS variables
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }; // Default black
  };
  
  const rgb = hexToRgb(companyColor);
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center px-8",
        caption_label: "text-xl font-medium",
        nav: "space-x-4 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-transparent p-0 opacity-80 hover:opacity-100 rounded-full border border-white/30"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-4",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-12 h-12 font-normal text-sm",
        row: "flex w-full mt-2",
        cell: "h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-full text-sm"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-white hover:bg-white hover:text-inherit focus:bg-white focus:text-inherit font-medium",
        day_today: "bg-white/30 text-white",
        day_outside:
          "day-outside text-white/50 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      style={{
        '--rdp-accent-color': `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 
        color: 'white'
      } as React.CSSProperties}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
