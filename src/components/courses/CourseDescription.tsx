
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { EditableText } from "@/components/ui/EditableText";
import { useLessonEdit } from '@/hooks/lesson/useLessonEdit';
import { useAuth } from '@/contexts/AuthContext';

interface CourseDescriptionProps {
  description: string | null;
  lessonId?: string;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({ 
  description, 
  lessonId 
}) => {
  const { updateLessonField } = useLessonEdit(lessonId);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;

  if (!description && !isAdmin) return null;

  const handleDescriptionUpdate = async (newDescription: string) => {
    if (lessonId) {
      await updateLessonField('description', newDescription);
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:bg-[#1f1f1f]">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sobre esta aula</h3>
        <EditableText
          value={description || ''}
          onSave={handleDescriptionUpdate}
          multiline={true}
          className="text-muted-foreground leading-relaxed min-h-[100px]"
          placeholder={isAdmin ? "Clique duas vezes para adicionar uma descrição..." : "Nenhuma descrição disponível"}
          canEdit={isAdmin && !!lessonId}
          renderAsHtml={true}
        />
      </CardContent>
    </Card>
  );
};
