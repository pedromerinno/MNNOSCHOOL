
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus, Rewind, Video, FileText, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from './types';
import { Lesson } from '@/components/courses/CourseLessonList';

interface LessonManagerProps {
  course: Course;
  onClose: () => void;
}

export const LessonManager: React.FC<LessonManagerProps> = ({ course, onClose }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    duration: '',
    type: 'video',
    order_index: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, [course.id]);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setLessons(data || []);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'Erro ao carregar aulas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLesson = () => {
    setCurrentLesson({
      title: '',
      description: '',
      duration: '',
      type: 'video',
      order_index: lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 0
    });
    setIsAddingLesson(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsEditingLesson(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('lessons')
          .delete()
          .eq('id', lessonId);

        if (error) {
          throw error;
        }

        toast({
          title: 'Aula excluída',
          description: 'A aula foi excluída com sucesso.',
        });

        fetchLessons();
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir aula',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleSaveLesson = async () => {
    try {
      if (!currentLesson.title || !currentLesson.type) {
        toast({
          title: 'Informações incompletas',
          description: 'Por favor, preencha pelo menos o título e o tipo da aula.',
          variant: 'destructive',
        });
        return;
      }

      if (isEditingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update({
            title: currentLesson.title,
            description: currentLesson.description,
            duration: currentLesson.duration,
            type: currentLesson.type,
            order_index: currentLesson.order_index,
          })
          .eq('id', currentLesson.id);

        if (error) {
          throw error;
        }

        toast({
          title: 'Aula atualizada',
          description: 'A aula foi atualizada com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert([{
            title: currentLesson.title,
            description: currentLesson.description,
            duration: currentLesson.duration,
            type: currentLesson.type,
            order_index: currentLesson.order_index,
            course_id: course.id
          }]);

        if (error) {
          throw error;
        }

        toast({
          title: 'Aula criada',
          description: 'A aula foi criada com sucesso.',
        });
      }

      setIsAddingLesson(false);
      setIsEditingLesson(false);
      fetchLessons();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar aula',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'text':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'quiz':
        return <Award className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Aulas para {course.title}</h3>
        <Button onClick={handleAddLesson}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Carregando aulas...</div>
      ) : lessons.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500 mb-4">Ainda não há aulas cadastradas para este curso.</p>
          <Button onClick={handleAddLesson}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Aula
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>{lesson.order_index}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {getLessonTypeIcon(lesson.type)}
                    <span className="ml-2">{lesson.title}</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{lesson.type}</TableCell>
                <TableCell>{lesson.duration || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditLesson(lesson)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Lesson Sheet */}
      <Sheet 
        open={isAddingLesson || isEditingLesson} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingLesson(false);
            setIsEditingLesson(false);
          }
        }}
      >
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {isEditingLesson ? 'Editar Aula' : 'Nova Aula'}
            </SheetTitle>
            <SheetDescription>
              {isEditingLesson 
                ? 'Atualize os detalhes da aula abaixo.' 
                : 'Preencha os detalhes para adicionar uma nova aula.'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="order" className="text-right">
                Ordem
              </Label>
              <Input
                id="order"
                type="number"
                value={currentLesson.order_index}
                onChange={(e) => setCurrentLesson({
                  ...currentLesson, 
                  order_index: parseInt(e.target.value)
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={currentLesson.title}
                onChange={(e) => setCurrentLesson({
                  ...currentLesson, 
                  title: e.target.value
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select
                value={currentLesson.type}
                onValueChange={(value) => setCurrentLesson({
                  ...currentLesson, 
                  type: value
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo de aula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label htmlFor="duration" className="text-right">
                Duração
              </Label>
              <Input
                id="duration"
                value={currentLesson.duration || ''}
                onChange={(e) => setCurrentLesson({
                  ...currentLesson, 
                  duration: e.target.value
                })}
                placeholder="Ex: 10 min"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 items-start">
              <Label htmlFor="description" className="text-right pt-2">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={currentLesson.description || ''}
                onChange={(e) => setCurrentLesson({
                  ...currentLesson, 
                  description: e.target.value
                })}
                placeholder="Descrição breve da aula"
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>
          
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingLesson(false);
                setIsEditingLesson(false);
              }}
            >
              <Rewind className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson}>
              Salvar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
