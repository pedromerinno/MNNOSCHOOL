import React from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { Course } from '@/hooks/my-courses/types';

interface MyCoursesHeroBannerProps {
  course: Course | null;
  companyColor: string;
}

export const MyCoursesHeroBanner: React.FC<MyCoursesHeroBannerProps> = ({ 
  course,
  companyColor
}) => {
  const navigate = useNavigate();

  if (!course) {
    return null;
  }

  const defaultImage = "/placeholder.svg";
  const imageSrc = course.image_url || defaultImage;

  const handleWatchNow = () => {
    navigate(`/courses/${course.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const instructorName = course.instructor || 'Instrutor';
  const instructorInitials = getInitials(instructorName);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8">
      <div className="relative aspect-[16/7] w-full min-h-[300px] md:min-h-[400px] lg:min-h-[450px]">
        {/* Background Image - No blur */}
        <img
          src={imageSrc}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        {/* Gradient overlay - no blur */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/30 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 lg:p-10 xl:p-12 text-white z-10">
          {/* Left Section - Title and Tags */}
          <div className="flex flex-col gap-4 md:gap-5 max-w-2xl lg:max-w-3xl">
            {/* Title - Smaller */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
              {course.title}
            </h2>
            
            {/* Tags - Below title with white borders */}
            <div className="flex flex-wrap gap-2">
              {course.tags?.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-transparent text-white border-white/80 hover:border-white rounded-full px-4 py-1.5 text-sm font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bottom Section - Instructor and Button */}
          <div className="flex items-end justify-between flex-wrap gap-4 mt-auto">
            {/* Instructor - Bottom Left */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-sm md:text-base font-semibold">
                  {instructorInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium text-sm md:text-base lg:text-lg">
                {instructorName}
              </span>
            </div>

            {/* Watch Now Button - Smaller */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleWatchNow();
              }}
              className="bg-white hover:bg-white/90 text-black rounded-full px-5 py-4 md:px-6 md:py-5 h-auto font-semibold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <span>Assistir agora</span>
              <Play className="h-4 w-4 md:h-5 md:w-5 fill-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

