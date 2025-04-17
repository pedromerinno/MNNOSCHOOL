
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CourseCarouselProps {
  courses: any[];
  loading: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({ courses, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Carousel>
        <CarouselContent>
          {courses.map((course) => (
            <CarouselItem key={course.id}>
              <div className="relative h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={course.image_url || "https://source.unsplash.com/random"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="space-y-4">
                      <div>
                        <span className="text-white/80 text-sm uppercase tracking-wider">
                          {course.type || "Criação"}
                        </span>
                        <h2 className="text-4xl font-bold text-white mt-2">
                          {course.title}
                        </h2>
                      </div>
                      <p className="text-white/90">
                        {course.description}
                      </p>
                      <Button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Watch now
                        <Play className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};
