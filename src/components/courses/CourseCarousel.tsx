
import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";

interface CourseCarouselProps {
  courses: any[];
  loading: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({
  courses = [],
  loading
}) => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const { user } = useAuth();
  const hasSingleCourse = courses.length === 1;
  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Default image to use when course image fails or is empty
  const defaultImage = "/placeholder.svg";

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('🖼️ CourseCarousel: Image failed to load, using default:', target.src);
    target.src = defaultImage;
  };

  const getImageSrc = (courseImageUrl: string | null | undefined): string => {
    // If no image URL or empty, use default
    if (!courseImageUrl || courseImageUrl.trim() === '') {
      console.log('🖼️ CourseCarousel: No image URL provided, using default');
      return defaultImage;
    }
    
    console.log('🖼️ CourseCarousel: Using course image:', courseImageUrl);
    return courseImageUrl;
  };

  const handleCourseClick = (courseId: string) => {
    console.log('🎯 CourseCarousel: Navigating to course:', courseId);
    navigate(`/courses/${courseId}`);
  };

  // Loading state with Skeleton UI
  if (loading) {
    return <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden relative">
        <Skeleton className="w-full h-full absolute inset-0" />
        <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end">
          <Skeleton className="w-16 h-6 md:w-24 md:h-8 mb-2 md:mb-4" />
          <Skeleton className="w-3/4 h-6 md:h-12 mb-2 md:mb-4" />
          <Skeleton className="w-1/2 h-3 md:h-4 mb-1 md:mb-2" />
          <Skeleton className="w-1/3 h-3 md:h-4 mb-4 md:mb-8" />
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="w-20 md:w-32 h-6 md:h-8" />
            </div>
            <Skeleton className="w-20 md:w-32 h-8 md:h-10" />
          </div>
        </div>
      </div>;
  }

  // Empty state with better messaging and button
  if (!courses || courses.length === 0) {
    return <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-4 md:p-8 text-center">
        <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-gray-900 dark:text-gray-100">
          Nenhum curso em destaque disponível
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6 md:mb-8 text-sm md:text-base">
          Esta empresa ainda não possui cursos em destaque ou você não tem acesso a eles.
        </p>
        {user?.is_admin && <Button onClick={() => navigate('/admin/courses')} className="bg-primary hover:bg-primary/90">
            Cadastrar Novo Curso
          </Button>}
      </div>;
  }

  // Special case for a single course - centered layout
  if (hasSingleCourse) {
    const course = courses[0];
    const imageSrc = getImageSrc(course.image_url);
    
    return (
      <div className="w-full relative overflow-hidden py-0 flex justify-center relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden group">
            <img 
              src={imageSrc}
              alt={course.title} 
              className="w-full h-full object-cover cursor-pointer" 
              onError={handleImageError}
              onClick={() => handleCourseClick(course.id)}
              onLoad={() => {
                console.log('🖼️ CourseCarousel: Single course image loaded successfully');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              {/* Company Logo */}
              {selectedCompany?.logo ? (
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                  <div className="w-16 h-16 md:w-12 md:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-1">
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
              ) : selectedCompany?.nome && (
                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                  <div className="w-16 h-16 md:w-12 md:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    <span className="text-xl md:text-xl font-bold text-white">
                      {selectedCompany.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 py-6 md:py-[40px] px-6 md:px-[40px]">
                <div className="flex flex-col md:flex-row justify-between md:items-end text-left lg:text-left">
                  <div className="space-y-2 md:space-y-4 max-w-xs md:max-w-xl mb-4 md:mb-0">
                    <div>
                      <div className="flex gap-1 md:gap-2 mb-2 md:mb-4 flex-wrap">
                        {course.tags?.slice(0, 1).map((tag: string, index: number) => (
                          <CompanyThemedBadge 
                            key={index} 
                            variant="outline" 
                            className="bg-transparent text-white border-white/40 px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm"
                          >
                            {tag}
                          </CompanyThemedBadge>
                        ))}
                        {course.tags && course.tags.length > 1 && (
                          <CompanyThemedBadge 
                            variant="outline" 
                            className="bg-transparent text-white border-white/40 px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm"
                          >
                            +{course.tags.length - 1}
                          </CompanyThemedBadge>
                        )}
                      </div>
                      <h2 className="text-xl md:text-4xl font-bold text-white mt-1 md:mt-2 leading-tight">
                        {course.title}
                      </h2>
                    </div>
                    <p className="text-white/90 line-clamp-2 md:line-clamp-2 text-sm md:text-base leading-relaxed max-w-xs md:max-w-lg">
                      {course.description}
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/courses/${course.id}`)} 
                    className="bg-white text-black hover:bg-gray-100 rounded-xl md:rounded-2xl px-3 py-2 md:px-[20px] md:py-[22px] text-xs md:text-base w-full md:w-auto"
                  >
                    Assistir
                    <Play className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal carousel with multiple courses - modified to show peeks of adjacent slides
  return (
    <div className="w-full relative overflow-hidden py-0 relative z-10">
      <Carousel 
        opts={{
          align: "center",
          loop: true
        }} 
        className="mx-auto"
        setApi={setApi}
      >
        <CarouselContent className="flex -ml-4">
          {courses.map(course => {
            const imageSrc = getImageSrc(course.image_url);
            
            return (
              <CarouselItem 
                key={course.id} 
                className="basis-full md:basis-[80%] lg:basis-[70%] pl-4 transition-opacity duration-300 py-[20px]"
              >
                <div 
                  className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden group cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <img 
                    src={imageSrc}
                    alt={course.title} 
                    className="w-full h-full object-cover" 
                    onError={handleImageError}
                    onLoad={() => {
                      console.log('🖼️ CourseCarousel: Carousel course image loaded successfully for:', course.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                    {/* Company Logo */}
                    {selectedCompany?.logo ? (
                      <div className="absolute top-4 left-4 md:top-8 md:left-8">
                        <div className="w-16 h-16 md:w-12 md:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-1">
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
                    ) : selectedCompany?.nome && (
                      <div className="absolute top-4 left-4 md:top-8 md:left-8">
                        <div className="w-16 h-16 md:w-12 md:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                          <span className="text-xl md:text-xl font-bold text-white">
                            {selectedCompany.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 py-6 md:py-[40px] px-6 md:px-[40px]">
                      <div className="flex flex-col md:flex-row justify-between md:items-end text-left lg:text-left">
                        <div className="space-y-2 md:space-y-4 max-w-xs md:max-w-xl mb-4 md:mb-0">
                          <div>
                            <div className="flex gap-1 md:gap-2 mb-2 md:mb-4 flex-wrap">
                              {course.tags?.slice(0, 1).map((tag: string, index: number) => (
                                <CompanyThemedBadge 
                                  key={index} 
                                  variant="outline" 
                                  className="bg-transparent text-white border-white/40 px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm"
                                >
                                  {tag}
                                </CompanyThemedBadge>
                              ))}
                              {course.tags && course.tags.length > 1 && (
                                <CompanyThemedBadge 
                                  variant="outline" 
                                  className="bg-transparent text-white border-white/40 px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm"
                                >
                                  +{course.tags.length - 1}
                                </CompanyThemedBadge>
                              )}
                            </div>
                            <h2 className="text-xl md:text-4xl font-bold text-white mt-1 md:mt-2 leading-tight">
                              {course.title}
                            </h2>
                          </div>
                          <p className="text-white/90 line-clamp-2 md:line-clamp-2 text-sm md:text-base leading-relaxed max-w-xs md:max-w-lg">
                            {course.description}
                          </p>
                        </div>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${course.id}`);
                          }} 
                          className="bg-white text-black hover:bg-gray-100 rounded-xl md:rounded-2xl px-3 py-2 md:px-[20px] md:py-[22px] text-xs md:text-base w-full md:w-auto"
                        >
                          Assistir
                          <Play className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Desktop arrows - only show on desktop */}
        {courses.length > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2" />
            <CarouselNext className="hidden md:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>
      
      {/* Mobile pagination indicators - only show on mobile for multiple courses */}
      {courses.length > 1 && (
        <div className="flex md:hidden justify-center mt-4 space-x-2">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === current - 1
                  ? 'w-6'
                  : 'opacity-50'
              }`}
              style={{
                backgroundColor: selectedCompany?.cor_principal || '#1EAEDB'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
