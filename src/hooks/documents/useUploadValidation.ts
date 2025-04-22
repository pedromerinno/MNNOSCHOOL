
import { toast } from "sonner";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

export const useUploadValidation = () => {
  const validateUpload = (file: File, userId: string | null, companyId: string | null): boolean => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("O arquivo não pode ser maior que 10MB");
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.");
      return false;
    }

    if (!userId || !companyId) {
      toast.error("Informações insuficientes para upload (usuário ou empresa ausente)");
      return false;
    }

    return true;
  };

  return { validateUpload };
};
