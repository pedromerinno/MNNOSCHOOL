
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
      
      <div className="space-y-8">
        {/* Hero section skeleton with improved gradient and dimensions */}
        <div className="relative h-[400px] rounded-xl overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 to-transparent"></div>
          <div className="relative z-10 h-full p-8 flex flex-col justify-between">
            <div className="w-1/2 space-y-4">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-40 rounded-md" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content grid with more realistic layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course stats with improved appearance */}
            <div className="flex gap-4 flex-wrap">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
            
            {/* Description with better structure */}
            <div className="space-y-4">
              <Skeleton className="h-7 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            </div>
            
            {/* Instructor section with improved layout */}
            <div className="space-y-4">
              <Skeleton className="h-7 w-48" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Lessons sidebar with improved card design */}
          <div>
            <Card className="h-full border border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <Skeleton className="h-6 w-32" />
                  </CardTitle>
                  <Skeleton className="h-5 w-12 rounded-md" />
                </div>
              </CardHeader>
              
              <CardContent>
                <ScrollArea className="h-auto max-h-[calc(100vh-280px)]">
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="p-3 rounded-md border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-3 items-center">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-40 mb-1" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
