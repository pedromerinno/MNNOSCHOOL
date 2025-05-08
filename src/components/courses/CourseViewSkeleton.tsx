
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CourseViewSkeleton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-8xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/courses')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Cursos
      </Button>
      
      <Skeleton className="h-8 w-2/3 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          
          {/* Course stats skeleton */}
          <div className="mt-8 space-y-8">
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <Skeleton className="h-32 w-full" />
            
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
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
            
            <CardContent>
              <ScrollArea className="h-auto max-h-[calc(100vh-280px)]">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
