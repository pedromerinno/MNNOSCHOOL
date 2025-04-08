
import React from 'react';
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
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

