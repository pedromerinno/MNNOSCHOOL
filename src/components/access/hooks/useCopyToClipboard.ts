
import { toast } from "sonner";

export const useCopyToClipboard = () => {
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(() => toast.error('Falha ao copiar para a área de transferência'));
  };

  return { copyToClipboard };
};
