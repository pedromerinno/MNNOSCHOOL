
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterOption } from "@/hooks/my-courses";

interface CourseFiltersProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: { label: string; value: FilterOption }[] = [
    { label: "Todos", value: "all" },
    { label: "Favoritos", value: "favorites" },
    { label: "Em progresso", value: "in-progress" },
    { label: "Concluídos", value: "completed" },
  ];

  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          variant="outline"
          size="sm"
          className={cn(
            "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
            activeFilter === filter.value
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};
