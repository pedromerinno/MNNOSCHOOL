
import React from 'react';
import { Book } from 'lucide-react';

interface CourseImageProps {
  imageUrl: string | null;
  title: string;
}

export const CourseImage: React.FC<CourseImageProps> = ({ 
  imageUrl, 
  title 
}) => {
  return (
    <>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-64 object-cover rounded-[30px] mb-6" 
        />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-[30px] mb-6">
          <Book className="h-16 w-16 text-gray-400" />
        </div>
      )}
    </>
  );
};
