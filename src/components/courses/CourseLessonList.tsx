
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Play, Clock, FileText, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Lesson = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  type: string;
  order_index: number;
  completed: boolean;
};

interface CourseLessonListProps {
  lessons: Lesson[];
  onStartLesson: (lessonId: string) => void;
}

// Group lessons into modules based on their order index
const groupLessonsByModules = (lessons: Lesson[]) => {
  // This is a simple grouping strategy based on order_index
  // In a real application, you'd have a proper module structure in your database
  
  // Sort lessons by order_index
  const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);
  
  // Group into modules (for demo, we'll create modules of 4 lessons each)
  const modules: { title: string; lessons: Lesson[] }[] = [];
  
  // Create module 1
  modules.push({
    title: "Module 1: Get Started with the Basics",
    lessons: sortedLessons.slice(0, Math.min(4, sortedLessons.length))
  });
  
  // Create module 2 if there are more lessons
  if (sortedLessons.length > 4) {
    modules.push({
      title: "Module 2: Advanced Concepts",
      lessons: sortedLessons.slice(4, Math.min(8, sortedLessons.length))
    });
  }
  
  // Create module 3 if there are more lessons
  if (sortedLessons.length > 8) {
    modules.push({
      title: "Module 3: Mastering the Skills",
      lessons: sortedLessons.slice(8)
    });
  }
  
  return modules;
};

export const CourseLessonList: React.FC<CourseLessonListProps> = ({ 
  lessons,
  onStartLesson
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "Module 1: Get Started with the Basics": true, // First module expanded by default
  });
  
  const modules = groupLessonsByModules(lessons);
  
  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    switch (type.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4 text-primary" />;
      case 'text':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'quiz':
        return <FileText className="h-4 w-4 text-primary" />;
      default:
        return <Play className="h-4 w-4 text-primary" />;
    }
  };
  
  const toggleModule = (moduleTitle: string) => {
    setExpandedModules({
      ...expandedModules,
      [moduleTitle]: !expandedModules[moduleTitle]
    });
  };

  return (
    <Card className="border border-border sticky top-4">
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="text-xl">Conteúdo do Curso</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {modules.map((module, moduleIndex) => (
          <div key={module.title} className="border-b border-border last:border-b-0">
            <div 
              className="p-4 font-medium flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleModule(module.title)}
            >
              <h3>{module.title}</h3>
              {expandedModules[module.title] ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {expandedModules[module.title] && (
              <div className="divide-y divide-border">
                {module.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className={cn(
                      "p-4 hover:bg-muted/30 transition-colors",
                      lesson.completed && "bg-green-50/50 dark:bg-green-900/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getLessonIcon(lesson.type, lesson.completed)}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{lesson.title}</h4>
                        
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <span className="capitalize mr-2">{lesson.type}</span>
                          {lesson.duration && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{lesson.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant={lesson.completed ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartLesson(lesson.id);
                        }}
                        className="ml-2 flex-shrink-0"
                      >
                        {lesson.completed ? "Revisar" : "Iniciar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* If there are no lessons */}
        {lessons.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma lição disponível para este curso ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

