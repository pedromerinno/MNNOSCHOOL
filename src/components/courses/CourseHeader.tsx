
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  instructor: string | null;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ 
  title,
  instructor 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {instructor && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Instrutor: {instructor}
        </p>
      )}
    </div>
  );
};
