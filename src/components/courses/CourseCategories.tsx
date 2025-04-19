
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  GridIcon,
  Layers,
  GraduationCap,
  Film,
  CircleDot,
  BookOpen,
  Palette,
  Code
} from "lucide-react";

// Map of icons for different categories
const iconMap: { [key: string]: any } = {
  "all": GridIcon,
  "vfx": Layers,
  "3d": GraduationCap,
  "motion": Film,
  "shader": CircleDot,
  "tutorial": BookOpen,
  "design": Palette,
  "code": Code
};

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
        const Icon = iconMap[category.id.toLowerCase()] || CircleDot;
        const isActive = activeCategory === category.id;
        const randomBg = bgColors[index % bgColors.length];
        
        return (
          <Card 
            key={category.id} 
            className={`inline-flex items-center gap-3 px-6 py-3 cursor-pointer transition-all rounded-xl
              ${isActive 
                ? 'bg-black text-white' 
                : `${randomBg} hover:bg-gray-100`
              }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <div className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-white'}`}>
              <Icon 
                size={18}
                className={isActive ? 'text-white' : 'text-black'}
              />
            </div>
            <span className="font-medium">{category.name}</span>
          </Card>
        );
      })}
    </div>
  );
};
