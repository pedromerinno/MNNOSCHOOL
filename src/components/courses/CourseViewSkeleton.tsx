
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const CourseViewSkeleton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <Skeleton className="h-8 w-2/3 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="max-h-[250px]">
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        <Skeleton className="h-24 w-full rounded-lg" />
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};
