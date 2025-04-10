
import React from 'react';
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterOption = 'all' | 'newest' | 'popular';

interface CourseFilterMenuProps {
  setActiveFilter: (filter: FilterOption) => void;
}

export const CourseFilterMenu: React.FC<CourseFilterMenuProps> = ({ setActiveFilter }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtrar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={() => setActiveFilter('all')}>
          Todos os Cursos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setActiveFilter('newest')}>
          Mais Recentes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setActiveFilter('popular')}>
          Mais Populares
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
