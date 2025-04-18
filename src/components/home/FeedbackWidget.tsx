
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { useReceivedFeedbacks } from "@/hooks/feedback/useReceivedFeedbacks";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReturnFeedbackDialog } from "../feedback/ReturnFeedbackDialog";

export const FeedbackWidget = () => {
  const { feedbacks, loading } = useReceivedFeedbacks();
  const navigate = useNavigate();

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

  return (
    <Card className="border-0 shadow-none overflow-hidden rounded-[30px] bg-[#FAFFF7] dark:bg-[#1A2E1A]">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="p-8 flex justify-between items-center">
          <h3 className="text-xl font-medium dark:text-white">Feedbacks</h3>
          <span className="text-xl font-medium dark:text-white">{feedbacks.length}</span>
        </div>
        
        <div className="px-8 pb-8 flex-1">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <p className="text-base mb-6 dark:text-gray-200">
                {feedbacks[0].content}
              </p>
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <Avatar className="h-8 w-8 mr-4">
                    <AvatarImage 
                      src={feedbacks[0].from_profile?.avatar || 'https://i.pravatar.cc/150'} 
                      alt={`${feedbacks[0].from_profile?.display_name || 'Usuário'} avatar`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {(feedbacks[0].from_profile?.display_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-black dark:text-white">
                      {feedbacks[0].from_profile?.display_name || 'Usuário'}
                    </span>
                    {feedbacks[0].from_profile?.cargo && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {feedbacks[0].from_profile.cargo}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {formatDate(feedbacks[0].created_at)}
                  </span>
                </div>
                {feedbacks[0].from_profile && (
                  <ReturnFeedbackDialog
                    toUser={feedbacks[0].from_profile}
                    trigger={
                      <button 
                        className="self-start px-8 py-3 rounded-full bg-white/80 dark:bg-white/10 text-black dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors"
                      >
                        retribuir
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum feedback recebido ainda
              </p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 dark:border-gray-800 py-6 text-center mb-6">
          <button 
            onClick={goToTeamProfile}
            className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ver todos
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
