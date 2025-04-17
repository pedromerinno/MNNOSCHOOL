import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";
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

export const CourseCarousel: React.FC<CourseCarouselProps> = ({ courses = [], loading }) => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();

  // Show empty state if no courses or still loading
  if (loading) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading featured courses...</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No featured courses available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Carousel>
        <CarouselContent>
          {courses.map((course) => (
            <CarouselItem key={course.id}>
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          {/* Company Logo */}
                          {selectedCompany?.logo && (
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 p-2">
                              <img 
                                src={selectedCompany.logo} 
                                alt={selectedCompany.nome}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          {/* Instructor Avatar */}
                          {course.instructor && (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-12 w-12 border-2 border-white/20">
                                <AvatarImage 
                                  src={`https://i.pravatar.cc/150?u=${course.instructor}`} 
                                  alt={course.instructor} 
                                />
                                <AvatarFallback className="bg-gray-700 text-white">
                                  {getInitials(course.instructor)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white/90">{course.instructor}</span>
                            </div>
                          )}
                        </div>
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
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
};
