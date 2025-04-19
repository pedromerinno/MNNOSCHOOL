
import React from "react";
import { Card } from "@/components/ui/card";

const bgColors = [
  'bg-blue-50',
  'bg-green-50',
  'bg-purple-50',
  'bg-orange-50',
  'bg-pink-50',
  'bg-teal-50',
  'bg-indigo-50',
  'bg-cyan-50',
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
  const categories = [
    { id: "all", name: "Todos" },
    ...availableCategories.map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1)
    }))
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category, index) => {
        const isActive = activeCategory === category.id;
        const randomBg = bgColors[index % bgColors.length];
        
        // Determine text color based on background
        const textColorMap: { [key: string]: string } = {
          'bg-blue-50': 'text-blue-800',
          'bg-green-50': 'text-green-800',
          'bg-purple-50': 'text-purple-800',
          'bg-orange-50': 'text-orange-800',
          'bg-pink-50': 'text-pink-800',
          'bg-teal-50': 'text-teal-800',
          'bg-indigo-50': 'text-indigo-800',
          'bg-cyan-50': 'text-cyan-800',
        };

        return (
          <div 
            key={category.id} 
            className={`inline-flex items-center gap-3 px-6 py-3 cursor-pointer transition-all rounded-2xl
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
    </div>
  );
};
