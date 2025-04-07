
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeleteLessonDialogProps {
  isOpen: boolean;
  lessonTitle: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteLessonDialog: React.FC<DeleteLessonDialogProps> = ({
  isOpen,
  lessonTitle,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="py-4">
            <div className="flex flex-col gap-3">
              <p>
                Tem certeza que deseja excluir a aula <span className="font-medium text-foreground">"{lessonTitle}"</span>?
              </p>
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>Esta ação não pode ser desfeita.</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir aula
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
