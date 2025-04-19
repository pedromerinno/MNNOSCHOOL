
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  GridIcon, 
  Layers,
  GraduationCap,
  Film,
  CircleDot
} from "lucide-react";

const categories = [
  { id: "all", name: "Todos", icon: GridIcon },
  { id: "vfx", name: "VFX e Composição", icon: Layers },
  { id: "3d", name: "3D", icon: GraduationCap },
  { id: "motion", name: "Motion Design", icon: Film },
  { id: "shader", name: "Shaders", icon: CircleDot },
];

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
}

export const CourseCategories: React.FC<CourseCategoriesProps> = ({ 
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category, index) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        const randomBg = bgColors[index % bgColors.length];
        
        return (
          <Card 
            key={category.id} 
            className={`inline-flex items-center gap-2 px-4 py-2 cursor-pointer transition-all rounded-lg
              ${isActive 
                ? 'bg-black text-white' 
                : `${randomBg} hover:bg-gray-100`
              }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <div className={`p-1.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-white'}`}>
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
