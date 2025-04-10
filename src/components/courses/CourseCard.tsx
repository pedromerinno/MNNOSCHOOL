
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from './CourseList';
import { Heart, ChevronRight, UserRound } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";
import { useCompanies } from "@/hooks/useCompanies";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { id, title, description, image_url, instructor, progress = 0, completed = false, tags = [] } = course;
  const { selectedCompany } = useCompanies();
  
  // Use company color or default
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  // Generate lighter and darker versions for badge styling
  const getBadgeStyle = (baseColor: string, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        background: 'rgba(34, 197, 94, 0.1)',
        color: 'rgb(34, 197, 94)',
        borderColor: 'rgba(34, 197, 94, 0.2)'
      };
    }
    
    // For in-progress with company color
    return {
      background: `${baseColor}10`,
      color: baseColor,
      borderColor: `${baseColor}30`
    };
  };
  
  const badgeStyle = getBadgeStyle(companyColor, completed);
  
  return (
    <Card className="group h-full overflow-hidden rounded-[20px] border border-gray-200 dark:border-gray-700">
      <Link to={`/courses/${id}`} className="block h-full">
        <div className="flex flex-col h-full">
          {/* Hero Image with reduced height */}
          <div className="relative">
            <div className="aspect-[16/6] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {image_url ? (
                <img 
                  src={image_url} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
              )}
            </div>
            
            {/* Like button */}
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute top-2 right-2 rounded-full h-8 w-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
              onClick={(e) => {
                e.preventDefault(); // Prevents the Link from being activated
                // Like functionality could be added here
              }}
            >
              <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
            
            {/* Progress Bar */}
            {progress > 0 && !completed && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full" 
                  style={{ width: `${progress}%`, backgroundColor: companyColor }}
                />
              </div>
            )}
          </div>
          
          {/* Content - better organized */}
          <div className="p-5 space-y-3 flex-grow flex flex-col">
            {/* Tags - moved to top for better organization */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 2).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs font-normal"
                    style={{
                      backgroundColor: `${companyColor}10`,
                      color: companyColor,
                      borderColor: `${companyColor}30`
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal"
                    style={{
                      backgroundColor: `${companyColor}10`,
                      color: companyColor,
                      borderColor: `${companyColor}30`
                    }}
                  >
                    +{tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Title - made slightly more prominent */}
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            
            {/* Description - with slightly better formatting */}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {description}
              </p>
            )}
            
            {/* Push metadata to bottom with flex-grow */}
            <div className="flex-grow"></div>
            
            {/* Metadata & Actions Row - better arranged */}
            <div className="flex items-center justify-between pt-2 mt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                {instructor ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7 border border-gray-200 dark:border-gray-700">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${instructor}`} alt={instructor} />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                        {getInitials(instructor)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 max-w-[100px]">
                      {instructor}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <UserRound className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Instrutor</span>
                  </div>
                )}
              </div>
              
              <div
                onClick={(e) => e.preventDefault()} 
                className="flex items-center space-x-2"
              >
                {completed ? (
                  <Badge 
                    variant="outline" 
                    className="px-3 py-1"
                    style={badgeStyle}
                  >
                    Concluído
                  </Badge>
                ) : progress > 0 ? (
                  <Badge 
                    variant="outline" 
                    className="px-3 py-1"
                    style={badgeStyle}
                  >
                    {progress}% concluído
                  </Badge>
                ) : null}
                
                <div className="rounded-full h-8 w-8 p-0 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};
