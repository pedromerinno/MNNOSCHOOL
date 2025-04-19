
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

interface CourseCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CourseCategories: React.FC<CourseCategoriesProps> = ({ 
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <Card 
            key={category.id} 
            className={`flex items-center gap-3 p-4 cursor-pointer transition-all rounded-full
              ${isActive 
                ? 'bg-black text-white' 
                : 'bg-gray-50 hover:bg-gray-100'
              }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <div className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-white'}`}>
              <Icon 
                size={20}
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
