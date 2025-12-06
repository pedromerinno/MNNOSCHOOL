import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 font-medium",
        completed 
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/30"
          : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {completed ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>Concluída</span>
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          <span>Marcar como concluído</span>
        </>
      )}
    </Button>
  );
};
