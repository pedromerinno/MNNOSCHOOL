
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export const CourseNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <h1 className="text-2xl font-semibold mb-4">Curso não encontrado</h1>
      <p className="mb-8">O curso que você está procurando não existe ou não está disponível para você.</p>
      
      <Button onClick={() => navigate('/courses')}>
        Ver todos os cursos
      </Button>
    </div>
  );
};
