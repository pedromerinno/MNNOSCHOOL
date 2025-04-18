
// Este componente foi substituído pela funcionalidade de edição in-line
// Mantido vazio para compatibilidade com importações existentes
// Pode ser removido no futuro quando todas as referências forem atualizadas

import { Dialog } from "@/components/ui/dialog";

interface EditFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: {
    id: string;
    content: string;
  } | null;
}

export const EditFeedbackDialog = ({ isOpen, onClose }: EditFeedbackDialogProps) => {
  return null;
};
