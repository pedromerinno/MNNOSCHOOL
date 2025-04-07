
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface CompleteButtonProps {
  completed: boolean;
  onMarkCompleted: () => void;
}

export const CompleteButton: React.FC<CompleteButtonProps> = ({
  completed,
  onMarkCompleted
}) => {
  return (
    <Button 
      onClick={onMarkCompleted}
      disabled={completed}
      variant={completed ? "outline" : "default"}
      className="flex items-center gap-2"
    >
      <CheckCircle className={`h-4 w-4 ${completed ? "text-green-500" : ""}`} />
      {completed ? "Aula concluída" : "Marcar como concluído"}
    </Button>
  );
};
