
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

interface Course {
  id: string;
  title: string;
  image: string;
  tags: string[];
}

interface RecentCoursesProps {
  courses: Course[];
}

export const RecentCourses: React.FC<RecentCoursesProps> = ({ courses }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cursos recentes</h2>
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
        {courses.slice(0, 6).map((course) => (
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
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex gap-2 mb-2">
                  {course.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 text-xs rounded-full bg-black/30 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-medium text-white">{course.title}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
