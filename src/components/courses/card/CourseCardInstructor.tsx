
import React from 'react';
import { UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/stringUtils";

interface CourseCardInstructorProps {
  instructor: string | null;
}

export const CourseCardInstructor: React.FC<CourseCardInstructorProps> = ({ instructor }) => {
  if (instructor) {
    return (
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
    );
  }
  
  return (
    <div className="flex items-center space-x-1">
      <UserRound className="h-4 w-4 text-gray-400" />
      <span className="text-xs text-gray-400">Instrutor</span>
    </div>
  );
};
