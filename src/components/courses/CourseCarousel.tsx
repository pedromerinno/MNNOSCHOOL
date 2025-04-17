
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyThemedBadge } from "@/components/ui/badge";
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
                  {/* Company Logo - Perfectly round */}
                  {selectedCompany?.logo && (
                    <div className="absolute top-8 left-8">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-1">
                        <img 
                          src={selectedCompany.logo} 
                          alt={selectedCompany.nome}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="space-y-4 max-w-xl">
                      <div>
                        <div className="flex gap-2 mb-2">
                          {course.tags?.map((tag: string, index: number) => (
                            <CompanyThemedBadge 
                              key={index} 
                              variant="outline" 
                              className="bg-transparent text-white border-white/40"
                            >
                              {tag}
                            </CompanyThemedBadge>
                          ))}
                        </div>
                        <h2 className="text-4xl font-bold text-white mt-2">
                          {course.title}
                        </h2>
                      </div>
                      <p className="text-white/90 mb-8">
                        {course.description}
                      </p>
                      <Button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Assistir
                        <Play className="w-4 h-4 ml-2" />
                      </Button>
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
