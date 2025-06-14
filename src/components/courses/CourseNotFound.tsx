
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CourseNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-8">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Curso não encontrado
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          O curso que você está procurando não existe ou você não tem acesso a ele.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/courses')} 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Cursos
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')} 
            className="w-full"
          >
            Ir para Home
          </Button>
        </div>
      </div>
    </div>
  );
};
