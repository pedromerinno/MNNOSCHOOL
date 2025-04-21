
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReceivedFeedbacks } from "@/hooks/feedback/useReceivedFeedbacks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { pt } from "date-fns/locale";

interface AllFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllFeedbackDialog({ open, onOpenChange }: AllFeedbackDialogProps) {
  const { feedbacks, loading } = useReceivedFeedbacks();

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: pt
      });
    } catch {
      return "recentemente";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl px-0 py-0">
        <DialogHeader className="px-6 pt-6 pb-1 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Todos os Feedbacks Recebidos</DialogTitle>
          <button 
            aria-label="Fechar"
            className="rounded-full p-2 hover:bg-muted transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <div className="px-6 pb-6 h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-24">Carregando feedbacks...</div>
          ) : feedbacks.length === 0 ? (
            <div className="flex items-center justify-center h-24">Nenhum feedback recebido ainda</div>
          ) : (
            <div className="space-y-5">
              {feedbacks.map(feedback => (
                <div key={feedback.id} className="flex flex-col gap-2 p-4 bg-green-50/80 dark:bg-green-900/20 rounded-lg">
                  <span className="text-base mb-2 text-gray-950 dark:text-gray-100">{feedback.content}</span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
                    <Avatar className="h-7 w-7 mr-2">
                      <AvatarImage
                        src={feedback.from_profile?.avatar || undefined}
                        alt={`${feedback.from_profile?.display_name || "Usuário"} avatar`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {(feedback.from_profile?.display_name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{feedback.from_profile?.display_name || "Usuário"}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDate(feedback.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
