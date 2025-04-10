
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface LessonNotFoundProps {
  courseId: string | undefined;
}

export const LessonNotFound: React.FC<LessonNotFoundProps> = ({ courseId }) => {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Aula não encontrada</h2>
          <p className="mb-6 text-muted-foreground">A aula que você está procurando não existe ou foi removida.</p>
          <Button asChild>
            <Link to={`/courses/${courseId}`}>Voltar para o curso</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};
