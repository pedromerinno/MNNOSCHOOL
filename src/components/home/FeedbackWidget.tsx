
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { useReceivedFeedbacks } from "@/hooks/feedback/useReceivedFeedbacks";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReturnFeedbackDialog } from "../feedback/ReturnFeedbackDialog";
import { UserProfile } from "@/hooks/useUsers";
import { useState, useEffect, memo } from "react";
import { AllFeedbackDialog } from "./AllFeedbackDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const FeedbackWidget = memo(() => {
  const { feedbacks, loading } = useReceivedFeedbacks();
  const navigate = useNavigate();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);


  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recentemente';
    }
  };

  const mapToUserProfile = (profile: any): UserProfile => ({
    id: profile.id,
    display_name: profile.display_name,
    email: null,
    // is_admin e cargo_id foram removidos de profiles - agora estão em user_empresa
    avatar: profile.avatar || null
  });

  const prevFeedback = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const nextFeedback = () => {
    setCurrentIndex((prev) => (prev < feedbacks.length - 1 ? prev + 1 : prev));
  };

  // Corrigir índice se necessário
  useEffect(() => {
    if (currentIndex > feedbacks.length - 1 && feedbacks.length > 0) {
      setCurrentIndex(feedbacks.length - 1);
    }
  }, [currentIndex, feedbacks.length]);

  const currentFeedback = feedbacks[currentIndex];

  return (
    <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-[#FAFFF7] dark:bg-[#222222] h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-6 flex justify-between items-center">
          <h3 className="text-xl font-medium dark:text-white text-left">Feedbacks</h3>
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost"
              className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={prevFeedback}
              disabled={loading || currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              className="h-10 w-10 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={nextFeedback}
              disabled={loading || currentIndex === feedbacks.length - 1 || feedbacks.length === 0}
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="px-6 pb-6 flex-1 overflow-y-auto flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : feedbacks.length > 0 && currentFeedback ? (
            <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-4">
              {/* Avatar acima da mensagem */}
              <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-700">
                <AvatarImage 
                  src={currentFeedback.from_profile?.avatar || 'https://i.pravatar.cc/150'} 
                  alt={`${currentFeedback.from_profile?.display_name || 'Usuário'} avatar`}
                  className="object-cover"
                  loading="lazy"
                />
                <AvatarFallback className="text-sm font-semibold">
                  {(currentFeedback.from_profile?.display_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Mensagem centralizada e com fonte maior */}
              <div className="w-full">
                <p className="text-lg md:text-xl leading-relaxed text-gray-900 dark:text-gray-100 px-4">
                  "{currentFeedback.content}"
                </p>
              </div>
              
              {/* Nome do usuário embaixo */}
              <div className="flex flex-col items-center gap-4 w-full">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {currentFeedback.from_profile?.display_name || 'Usuário'}
                </span>
                
                {/* Botão retribuir centralizado */}
                {currentFeedback.from_profile && (
                  <ReturnFeedbackDialog
                    toUser={mapToUserProfile(currentFeedback.from_profile)}
                    trigger={
                      <button 
                        className="px-8 py-3 rounded-full bg-white/90 dark:bg-[#1F1F1F] text-gray-900 dark:text-white hover:bg-white dark:hover:bg-[#2C2C2C] transition-colors font-medium shadow-sm"
                      >
                        retribuir
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <EmptyState
                title="Nenhum feedback recebido ainda"
                icons={[MessageSquare]}
                className="border-0 bg-transparent hover:bg-transparent p-8 max-w-none"
              />
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 py-3 text-center mb-4">
          <button 
            onClick={() => setFeedbackDialogOpen(true)}
            className="text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors px-6 py-2 rounded-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            ver todos
          </button>
        </div>
      </CardContent>
      {feedbackDialogOpen && <AllFeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />}
    </Card>
  );
});
