
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";

interface FeaturedCourse {
  id: string;
  title: string;
  image: string;
  instructor: string;
  tags: string[];
}

interface FeaturedCourseHeroProps {
  course: FeaturedCourse;
}

export const FeaturedCourseHero: React.FC<FeaturedCourseHeroProps> = ({ course }) => {
  return (
    <div className="mb-12">
      <div className="relative rounded-xl overflow-hidden">
        <div className="h-80 bg-gradient-to-r from-gray-800 to-gray-900 relative">
          <img 
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <div className="flex gap-2 mt-4">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 text-xs rounded-full bg-black/30 text-white"
                  >
                    {tag}
                  </span>
                ))}
                {course.tags.length > 3 && (
                  <span 
                    className="px-3 py-1 text-xs rounded-full bg-black/30 text-white"
                  >
                    +{course.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs">{course.instructor.charAt(0)}</span>
                </div>
                <span className="text-white">{course.instructor}</span>
              </div>
              <Button variant="default" className="rounded-full px-4 bg-white text-black hover:bg-gray-100">
                <span>Assistir agora</span>
                <Play className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
