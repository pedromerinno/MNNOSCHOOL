
import React from "react";
import { Card } from "@/components/ui/card";

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
            className={`inline-flex items-center gap-3 px-10 py-5 cursor-pointer transition-all rounded-3xl
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

