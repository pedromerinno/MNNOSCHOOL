
import React, { useState, useRef, useEffect } from "react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const bgColors = [
  'bg-blue-100',
  'bg-green-100',
  'bg-purple-100',
  'bg-orange-100',
  'bg-pink-100',
  'bg-teal-100',
  'bg-indigo-100',
  'bg-cyan-100',
];

interface CourseCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  availableCategories: string[];
}

export const CourseCategories: React.FC<CourseCategoriesProps> = ({ 
  activeCategory,
  onCategoryChange,
  availableCategories
}) => {
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: "all", name: "Todos" },
    ...availableCategories.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1)
    }))
  ];

  useEffect(() => {
    // Calculate how many categories can fit in one row
    const calculateVisibleCategories = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const categoryWidth = 140; // Estimated average width including margins
      const seeMoreButtonWidth = 180; // Width of the "See more" button
      
      // Calculate max items that can fit in one row while leaving space for "See more" button
      const maxItems = Math.floor((containerWidth - seeMoreButtonWidth) / categoryWidth);
      
      // Ensure we display at least 1 category (plus the "All" category)
      const itemsToShow = Math.max(1, Math.min(maxItems, categories.length - 1));
      
      // Always include "All" category and then add as many as can fit
      setVisibleCategories(categories.slice(0, itemsToShow + 1).map(c => c.id));
    };

    calculateVisibleCategories();
    window.addEventListener('resize', calculateVisibleCategories);
    
    return () => {
      window.removeEventListener('resize', calculateVisibleCategories);
    };
  }, [categories.length]);

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-3">
      {/* Visible categories */}
      {categories.filter(category => visibleCategories.includes(category.id)).map((category, index) => {
        const isActive = activeCategory === category.id;
        const randomBg = bgColors[index % bgColors.length];
        
        const textColorMap: { [key: string]: string } = {
          'bg-blue-100': 'text-blue-900',
          'bg-green-100': 'text-green-900',
          'bg-purple-100': 'text-purple-900',
          'bg-orange-100': 'text-orange-900',
          'bg-pink-100': 'text-pink-900',
          'bg-teal-100': 'text-teal-900',
          'bg-indigo-100': 'text-indigo-900',
          'bg-cyan-100': 'text-cyan-900',
        };

        return (
          <div 
            key={category.id} 
            className={`inline-flex items-center gap-3 px-6 py-3 cursor-pointer transition-all rounded-3xl
              ${isActive 
                ? 'bg-black text-white' 
                : `${randomBg} ${textColorMap[randomBg]} hover:opacity-80`
              }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="font-medium">{category.name}</span>
          </div>
        );
      })}

      {/* See more button, only show if there are more categories than we can display */}
      {categories.length > visibleCategories.length && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="rounded-3xl inline-flex items-center gap-2 px-5 py-6 h-auto"
            >
              Ver mais categorias
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] max-h-[400px] overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category, index) => {
                const isActive = activeCategory === category.id;
                const randomBg = bgColors[index % bgColors.length];
                
                const textColorMap: { [key: string]: string } = {
                  'bg-blue-100': 'text-blue-900',
                  'bg-green-100': 'text-green-900',
                  'bg-purple-100': 'text-purple-900',
                  'bg-orange-100': 'text-orange-900',
                  'bg-pink-100': 'text-pink-900',
                  'bg-teal-100': 'text-teal-900',
                  'bg-indigo-100': 'text-indigo-900',
                  'bg-cyan-100': 'text-cyan-900',
                };

                return (
                  <div 
                    key={category.id} 
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-all rounded-xl
                      ${isActive 
                        ? 'bg-black text-white' 
                        : `${randomBg} ${textColorMap[randomBg]} hover:opacity-80`
                      }`}
                    onClick={() => {
                      onCategoryChange(category.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="font-medium">{category.name}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
