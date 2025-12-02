
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

export const FeedbackWidget = memo(() => {
  const { feedbacks, loading } = useReceivedFeedbacks();
  const navigate = useNavigate();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToTeamProfile = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      navigate(`/team/${data.user.id}`);
    }
  };

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
    <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-[#FAFFF7] dark:bg-[#222222]">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-xl font-medium dark:text-white text-left">Feedbacks</h3>
          <div className="flex space-x-2">
            <Button 
              size="icon" 
              variant="ghost"
              className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={prevFeedback}
              disabled={loading || currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={nextFeedback}
              disabled={loading || currentIndex === feedbacks.length - 1 || feedbacks.length === 0}
            >
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="px-8 pb-8 flex-1">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : feedbacks.length > 0 && currentFeedback ? (
            <div className="bg-green-50 dark:bg-[#2C2C2C] rounded-lg p-6">
              <p className="text-base mb-6 dark:text-gray-200 text-left">
                {currentFeedback.content}
              </p>
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <Avatar className="h-8 w-8 mr-4">
                    <AvatarImage 
                      src={currentFeedback.from_profile?.avatar || 'https://i.pravatar.cc/150'} 
                      alt={`${currentFeedback.from_profile?.display_name || 'Usuário'} avatar`}
                      className="object-cover"
                      loading="lazy"
                    />
                    <AvatarFallback>
                      {(currentFeedback.from_profile?.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-medium text-black dark:text-white">
                      {currentFeedback.from_profile?.display_name || 'Usuário'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {formatDate(currentFeedback.created_at)}
                  </span>
                </div>
                {currentFeedback.from_profile && (
                  <ReturnFeedbackDialog
                    toUser={mapToUserProfile(currentFeedback.from_profile)}
                    trigger={
                      <button 
                        className="self-start px-8 py-3 rounded-full bg-white/80 dark:bg-[#1F1F1F] text-black dark:text-white hover:bg-white dark:hover:bg-[#2C2C2C] transition-colors"
                      >
                        retribuir
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-[#1F1F1F] rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-[#757576]">
                Nenhum feedback recebido ainda
              </p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 py-6 text-center mb-6">
          <button 
            onClick={() => setFeedbackDialogOpen(true)}
            className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ver todos
          </button>
        </div>
      </CardContent>
      {feedbackDialogOpen && <AllFeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />}
    </Card>
  );
});
