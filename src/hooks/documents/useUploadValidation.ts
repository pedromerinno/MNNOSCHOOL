
import { toast } from "sonner";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

export const useUploadValidation = () => {
  const validateUpload = (file: File | null, userId: string | null, companyId: string | null) => {
    if (!userId || !companyId || !file) {
      toast.error('Informações insuficientes para upload');
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

    return true;
  };

  return { validateUpload };
};
