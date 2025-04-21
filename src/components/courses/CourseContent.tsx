
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseDescription } from './CourseDescription';
import { Star } from 'lucide-react';

interface CourseContentProps {
  description: string | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
  companyColor: string;
}

export const CourseContent: React.FC<CourseContentProps> = ({
  description,
  activeTab,
  setActiveTab,
  companyColor
}) => {
  return (
    <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full rounded-2xl p-1.5 bg-transparent dark:bg-transparent gap-2">
        <TabsTrigger 
          value="description"
          className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
          style={{
            backgroundColor: activeTab === "description" ? `${companyColor}10` : undefined,
            borderColor: activeTab === "description" ? companyColor : undefined,
            color: activeTab === "description" ? companyColor : undefined
          }}
        >
          Descrição
        </TabsTrigger>
        <TabsTrigger 
          value="reviews"
          className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
          style={{
            backgroundColor: activeTab === "reviews" ? `${companyColor}10` : undefined,
            borderColor: activeTab === "reviews" ? companyColor : undefined,
            color: activeTab === "reviews" ? companyColor : undefined
          }}
        >
          Avaliações
        </TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-12">
        <CourseDescription description={description} />
      </TabsContent>
      <TabsContent value="reviews" className="mt-12">
        <div className="text-center py-8">
          <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium mb-1">Sem avaliações ainda</h3>
          <p className="text-muted-foreground">
            Seja o primeiro a avaliar este curso
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
