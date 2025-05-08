
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Smile } from "lucide-react";
import { UserProfile } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface FeedbackFormProps {
  toUser: UserProfile;
}

export const FeedbackForm = ({ toUser }: FeedbackFormProps) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();

  const handleSubmit = async () => {
    if (!feedback.trim() || !toUser.id || !selectedCompany) return;
    
    try {
      setIsSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from('user_feedbacks')
        .insert({
          content: feedback,
          from_user_id: userData.user.id,
          to_user_id: toUser.id,
          company_id: selectedCompany.id
        });
      
      if (error) throw error;
      
      toast.success("Feedback enviado com sucesso!");
      setFeedback("");
    } catch (error: any) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Erro ao enviar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract first letter of display name for avatar fallback
  const getInitial = (name?: string | null) => {
    if (name) {
      return name.substring(0, 1).toUpperCase();
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
          <AvatarImage src={userProfile?.avatar || undefined} alt={userProfile?.display_name || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitial(userProfile?.display_name) || <Smile className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder={`Escreva seu feedback para ${toUser.display_name || 'o usuário'}...`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="resize-none bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-xl focus:ring-primary focus:border-primary"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!feedback.trim() || isSubmitting}
              className="rounded-full px-5 flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" /> 
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
