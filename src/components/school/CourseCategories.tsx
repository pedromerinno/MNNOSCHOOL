
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories } from "@/data/school-mock-data";

interface CourseCategoriesProps {
  activeTab: string;
  onCategoryChange: (value: string) => void;
}

export const CourseCategories: React.FC<CourseCategoriesProps> = ({ 
  activeTab, 
  onCategoryChange 
}) => {
  return (
    <div className="mb-8">
      <Tabs defaultValue="all" value={activeTab} onValueChange={onCategoryChange}>
        <TabsList className="overflow-x-auto w-full justify-start bg-transparent py-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className={`rounded-full px-4 py-2 ${
                activeTab === category.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};
