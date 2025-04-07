
import React from 'react';
import { Button } from "@/components/ui/button";

interface LessonFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const LessonFormActions: React.FC<LessonFormActionsProps> = ({
  onCancel,
  isSubmitting,
  isEditing
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={onCancel} type="button">
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : isEditing ? "Atualizar Aula" : "Adicionar Aula"}
      </Button>
    </div>
  );
};
