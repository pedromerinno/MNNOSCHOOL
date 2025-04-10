
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from './CourseList';
import { Heart, ChevronRight, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { id, title, description, image_url, instructor, progress = 0, completed = false, tags = [] } = course;
  
  return (
    <Card className={cn(
      "overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-all",
      "w-[320px] max-w-[350px]" // Increased width significantly
    )}>
      {/* Hero Image */}
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {image_url ? (
            <img 
              src={image_url} 
              alt={title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
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
        >
          <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Button>
        
        {/* Progress Bar */}
        {progress > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-500 dark:bg-blue-600" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        
        {/* Description - optional, can be removed for ultra minimal */}
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Metadata & Actions Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {instructor && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                  {getInitials(instructor)}
                </AvatarFallback>
              </Avatar>
            )}
            
            {completed ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                Concluído
              </Badge>
            ) : progress > 0 ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                {progress}% concluído
              </Badge>
            ) : null}
          </div>
          
          <Link to={`/courses/${id}`}>
            <Button 
              size="sm" 
              variant="ghost" 
              className="rounded-full h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
