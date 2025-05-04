
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";

interface CourseCarouselProps {
  courses: any[];
  loading: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({ courses = [], loading }) => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const { user } = useAuth();

  // Loading state with Skeleton UI
  if (loading) {
    return (
      <div className="w-full h-[500px] rounded-2xl overflow-hidden relative">
        <Skeleton className="w-full h-full absolute inset-0" />
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <Skeleton className="w-24 h-8 mb-4" />
          <Skeleton className="w-3/4 h-12 mb-4" />
          <Skeleton className="w-1/2 h-4 mb-2" />
          <Skeleton className="w-1/3 h-4 mb-8" />
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="w-32 h-8" />
            </div>
            <Skeleton className="w-32 h-10" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state with better messaging and button
  if (!courses || courses.length === 0) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Nenhum curso em destaque disponível
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          Esta empresa ainda não possui cursos em destaque ou você não tem acesso a eles.
        </p>
        {user?.is_admin && (
          <Button 
            onClick={() => navigate('/admin/courses')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Novo Curso
          </Button>
        )}
      </div>
    );
  }

  // Normal carousel with courses
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
                  {/* Company Logo */}
                  {selectedCompany?.logo && (
                    <div className="absolute top-8 left-8">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-1">
                        <img 
                          src={selectedCompany.logo} 
                          alt={selectedCompany.nome}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-4 max-w-xl">
                        <div>
                          <div className="flex gap-2 mb-4">
                            {course.tags?.slice(0, 3).map((tag: string, index: number) => (
                              <CompanyThemedBadge 
                                key={index} 
                                variant="outline" 
                                className="bg-transparent text-white border-white/40 px-4 py-1.5"
                              >
                                {tag}
                              </CompanyThemedBadge>
                            ))}
                            {course.tags && course.tags.length > 3 && (
                              <CompanyThemedBadge 
                                variant="outline" 
                                className="bg-transparent text-white border-white/40 px-4 py-1.5"
                              >
                                +{course.tags.length - 3}
                              </CompanyThemedBadge>
                            )}
                          </div>
                          <h2 className="text-4xl font-bold text-white mt-2">
                            {course.title}
                          </h2>
                        </div>
                        <p className="text-white/90 line-clamp-3">
                          {course.description}
                        </p>
                      </div>
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
        {courses.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-[-20px] md:left-[-50px] top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-[-20px] md:right-[-50px] top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>
    </div>
  );
};
