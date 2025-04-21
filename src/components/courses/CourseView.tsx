
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonNavigation } from './useLessonNavigation';
import { CourseHeader } from './CourseHeader';
import { CourseHero } from './CourseHero';
import { CourseLessonList } from './CourseLessonList';
import { CourseViewSkeleton } from './CourseViewSkeleton';
import { CourseNotFound } from './CourseNotFound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseDescription } from './CourseDescription';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Star, Plus } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { LessonManager } from '@/components/admin/courses/LessonManager';
import { Button } from '@/components/ui/button';
import { CourseForm } from '@/components/admin/CourseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CourseFormValues } from '@/components/admin/courses/form/CourseFormTypes';
import { updateCourse } from '@/services/courseService';
import { toast } from 'sonner';

export const CourseView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading } = useCourseData(courseId);
  const { startLesson } = useLessonNavigation(courseId);
  const [activeTab, setActiveTab] = useState<string>("description");
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  const [showLessonManager, setShowLessonManager] = useState(false);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  
  // Estado para controlar o diálogo de edição do curso
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditCourse = () => {
    setIsEditDialogOpen(true);
  };

  const handleCourseUpdate = async (data: CourseFormValues) => {
    if (!courseId) return;
    
    setIsSubmitting(true);
    try {
      await updateCourse(courseId, data);
      toast.success("Curso atualizado com sucesso");
      setIsEditDialogOpen(false);
      // Recarregar a página para mostrar as mudanças
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      toast.error("Erro ao atualizar curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <CourseViewSkeleton />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  const firstLessonId = course.lessons && course.lessons.length > 0 ? course.lessons[0].id : undefined;

  const totalDuration = course.lessons && course.lessons.length > 0 
    ? course.lessons.reduce((total, lesson) => {
        const minutes = lesson.duration 
          ? parseInt(lesson.duration.replace(/[^0-9]/g, '')) 
          : 0;
        return total + minutes;
      }, 0)
    : 0;
  
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const formattedDuration = hours > 0 
    ? `${hours}h ${minutes > 0 ? `${minutes} min` : ''}` 
    : `${minutes} min`;

  // Preparar os dados iniciais para o formulário de edição
  // Não precisamos passar o objeto course completo, apenas os campos necessários para o formulário
  const initialFormData: CourseFormValues = {
    title: course.title,
    description: course.description || "",
    image_url: course.image_url || "",
    instructor: course.instructor || "",
    tags: course.tags || [],
    companyId: selectedCompany?.id || ""
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <CourseHeader 
        title={course.title} 
        instructor={course.instructor} 
      />
      
      <div className="mb-8">
        <CourseHero 
          imageUrl={course.image_url} 
          title={course.title}
          instructor={course.instructor || ""}
          favorite={course.favorite || false}
          courseId={course.id}
          firstLessonId={firstLessonId}
          showEditButton={isAdmin}
          onEditCourse={handleEditCourse}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-8/12 space-y-8">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formattedDuration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{course.lessons?.length || 0} lições</span>
            </div>
            {course.tags && course.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          
          {course.progress > 0 && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Seu progresso</h3>
                <span className="text-sm">{course.progress}% concluído</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full rounded-2xl p-1.5 bg-transparent dark:bg-transparent gap-2">
              <TabsTrigger 
                value="description"
                className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
                style={{
                  backgroundColor: activeTab === "description" ? `${companyColor}10` : undefined,
                  borderColor: activeTab === "description" ? companyColor : undefined,
                  color: activeTab === "description" ? companyColor : undefined
                }}
              >
                Descrição
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
                style={{
                  backgroundColor: activeTab === "reviews" ? `${companyColor}10` : undefined,
                  borderColor: activeTab === "reviews" ? companyColor : undefined,
                  color: activeTab === "reviews" ? companyColor : undefined
                }}
              >
                Avaliações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-12">
              <CourseDescription description={course.description} />
            </TabsContent>
            <TabsContent value="reviews" className="mt-12">
              <div className="text-center py-8">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">Sem avaliações ainda</h3>
                <p className="text-muted-foreground">
                  Seja o primeiro a avaliar este curso
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-full md:w-4/12 mt-8 md:mt-0 relative">
          {isAdmin && (
            <div className="mb-6">
              <Button 
                className="bg-primary text-white shadow-lg gap-2 rounded-xl w-full font-bold text-base py-3"
                onClick={() => setShowLessonManager(true)}
                variant="default"
                size="lg"
                aria-label="Gerenciar aulas"
              >
                <Plus className="w-5 h-5" />
                Gerenciar aulas
              </Button>
              <LessonManager
                courseId={course.id}
                courseTitle={course.title}
                open={showLessonManager}
                onClose={() => setShowLessonManager(false)}
              />
            </div>
          )}
          <CourseLessonList 
            lessons={course.lessons} 
            courseId={course.id}  
            onStartLesson={startLesson} 
          />
        </div>
      </div>

      {/* Diálogo para edição do curso */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          <CourseForm
            initialData={initialFormData}
            onSubmit={handleCourseUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
            onClose={() => setIsEditDialogOpen(false)}
            preselectedCompanyId={selectedCompany?.id}
            showCompanySelector={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
