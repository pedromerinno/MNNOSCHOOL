
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
    <div className="mb-8">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/courses')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {instructor && (
        <p className="text-muted-foreground">
          Instrutor: {instructor}
        </p>
      )}
    </div>
  );
};
