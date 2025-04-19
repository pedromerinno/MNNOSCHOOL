
import React from "react";
import { Card } from "@/components/ui/card";

const categories = [
  { id: "vfx", name: "VFX e Composição" },
  { id: "3d", name: "3D" },
  { id: "motion", name: "Motion Design" },
  { id: "shader", name: "Shaders" },
];

export const CourseCategories = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="p-8 hover:bg-gray-50 transition-colors rounded-2xl border-none shadow-none"
        >
          <h3 className="font-medium text-lg mb-3">{category.name}</h3>
          <p className="text-sm text-gray-500">
            Explore os cursos desta categoria
          </p>
        </Card>
      ))}
    </div>
  );
};

