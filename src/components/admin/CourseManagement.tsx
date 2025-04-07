
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Book } from "lucide-react";
import { CourseList } from './courses/CourseList';
import { useCourses } from './courses/useCourses';
import { Course } from './courses/types';

export type { Course };

export const CourseManagement: React.FC = () => {
  const [activeTab] = useState("courses");
  const { 
    courses, 
    isLoading, 
    selectedCourse, 
    setSelectedCourse,
    isFormOpen, 
    setIsFormOpen,
    isCompanyManagerOpen, 
    setIsCompanyManagerOpen, 
    isSubmitting
  } = useCourses();

  return (
    <div className="space-y-4">
      <Card className="mb-8">
        <CardHeader className="pb-0">
          <Tabs value={activeTab}>
            <TabsList className="w-full max-w-md mx-auto">
              <TabsTrigger 
                value="courses" 
                className="flex items-center"
              >
                <Book className="h-4 w-4 mr-2" />
                Cursos
              </TabsTrigger>
            </TabsList>
          
            <CardContent className="pt-6">
              <TabsContent value="courses">
                <CourseList 
                  courses={courses}
                  isLoading={isLoading}
                  selectedCourse={selectedCourse}
                  setSelectedCourse={setSelectedCourse}
                  isFormOpen={isFormOpen}
                  setIsFormOpen={setIsFormOpen}
                  isCompanyManagerOpen={isCompanyManagerOpen}
                  setIsCompanyManagerOpen={setIsCompanyManagerOpen}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};
