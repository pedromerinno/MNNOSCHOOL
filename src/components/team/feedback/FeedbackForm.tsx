
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { UserProfile } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";

interface FeedbackFormProps {
  toUser: UserProfile;
}

export const FeedbackForm = ({ toUser }: FeedbackFormProps) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedCompany } = useCompanies();

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
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast.error("Erro ao enviar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Enviar Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder={`Escreva seu feedback para ${toUser.display_name || 'o usuário'}...`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!feedback.trim() || isSubmitting}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Send className="h-4 w-4" /> 
            Enviar Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
