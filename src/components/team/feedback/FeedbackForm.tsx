
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";

interface FeedbackFormProps {
  toUser: UserProfile;
  onFeedbackSent?: (feedback: any) => void;
}

export const FeedbackForm = ({ toUser, onFeedbackSent }: FeedbackFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userProfile } = useAuth();
  const { selectedCompany } = useCompanies();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("O feedback não pode estar vazio");
      return;
    }
    
    if (!user || !selectedCompany) {
      toast.error("Erro ao enviar feedback. Tente novamente mais tarde.");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        content,
        from_user_id: user.id,
        to_user_id: toUser.id,
        company_id: selectedCompany.id
      };

      const { data, error } = await supabase
        .from('user_feedbacks')
        .insert(feedbackData)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Feedback enviado com sucesso!");
      setContent("");
      
      // Call the callback if provided
      if (onFeedbackSent && data) {
        // Add the from_profile to match the expected format
        const enrichedFeedback = {
          ...data,
          from_profile: {
            id: user.id,
            display_name: userProfile.displayName || user.email || user.id,
            avatar: userProfile.avatar || null
          }
        };
        onFeedbackSent(enrichedFeedback);
      }
    } catch (err) {
      console.error("Error sending feedback:", err);
      toast.error("Erro ao enviar feedback. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 border-0 bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="text-lg font-medium mb-4">Enviar feedback para {toUser.display_name}</h3>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva seu feedback aqui..."
          className="mb-4 min-h-[120px]"
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Enviando..." : "Enviar Feedback"}
        </Button>
      </form>
    </Card>
  );
};
