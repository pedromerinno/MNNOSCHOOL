
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

interface Course {
  id: string;
  title: string;
  image: string;
  tags: string[];
  progress?: number;
}

interface ContinueLearningProps {
  courses: Course[];
}

export const ContinueLearning: React.FC<ContinueLearningProps> = ({ courses }) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Continue assistindo</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden border-0 shadow-sm">
            <div className="relative h-44">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex gap-2 mb-2">
                {course.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-medium mb-2">{course.title}</h3>
              {course.progress !== undefined && course.progress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
