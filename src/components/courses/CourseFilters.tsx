
import React from "react";
import { Button } from "@/components/ui/button";
import { ListCheck, Star, CheckCircle, Play } from "lucide-react";

type FilterOption = 'all' | 'favorites' | 'completed' | 'in-progress';

interface CourseFiltersProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="mb-8">
      <div className="flex overflow-x-auto pb-2 gap-3">
        <Button variant="outline" 
            className={`rounded-full px-4 py-2 ${activeFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-gray-800 hover:text-white`}
            onClick={() => onFilterChange('all')}>
          <ListCheck className="mr-2 h-4 w-4" />
          Todos
        </Button>
        <Button variant="outline" 
            className={`rounded-full px-4 py-2 ${activeFilter === 'favorites' ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-orange-500 hover:text-white`}
            onClick={() => onFilterChange('favorites')}>
          <Star className="mr-2 h-4 w-4" />
          Favoritados
        </Button>
        <Button variant="outline" 
            className={`rounded-full px-4 py-2 ${activeFilter === 'completed' ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-green-500 hover:text-white`}
            onClick={() => onFilterChange('completed')}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Concluídos
        </Button>
        <Button variant="outline" 
            className={`rounded-full px-4 py-2 ${activeFilter === 'in-progress' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-700'} border-none hover:bg-blue-500 hover:text-white`}
            onClick={() => onFilterChange('in-progress')}>
          <Play className="mr-2 h-4 w-4" />
          Iniciados
        </Button>
      </div>
    </div>
  );
};
