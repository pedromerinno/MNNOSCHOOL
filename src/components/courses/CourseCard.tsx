
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from './CourseList';
import { Play, Book, Check } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { id, title, description, image_url, instructor, progress = 0, completed = false } = course;
  
  const getStatusConfig = () => {
    if (completed) {
      return {
        label: "Concluído",
        icon: Check,
        variant: "outline" as const,
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    } else if (progress > 0) {
      return {
        label: "Continuar",
        icon: Play,
        variant: "default" as const,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    } else {
      return {
        label: "Começar",
        icon: Play,
        variant: "default" as const,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      };
    }
  };
  
  const { label, icon: Icon, variant, color, bgColor } = getStatusConfig();

  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="relative h-40 overflow-hidden">
        {image_url ? (
          <img 
            src={image_url} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <Book className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {progress > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-1 bg-blue-600" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {completed && (
          <div className="absolute top-2 right-2 rounded-full p-1 bg-green-500 text-white">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {instructor && (
          <p className="text-sm text-gray-500 mb-2 dark:text-gray-400">
            Instrutor: {instructor}
          </p>
        )}
        
        {description && (
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-sm">
            {description}
          </p>
        )}
        
        {progress > 0 && !completed && (
          <p className="text-sm text-gray-500 mt-3 dark:text-gray-400">
            {progress}% completo
          </p>
        )}
      </CardContent>
      
      <CardFooter>
        <Link to={`/courses/${id}`} className="w-full">
          <Button variant={variant} className="w-full">
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
