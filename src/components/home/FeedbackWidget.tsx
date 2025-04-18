
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale/pt-BR';
import { useReceivedFeedbacks } from "@/hooks/feedback/useReceivedFeedbacks";
import { supabase } from "@/integrations/supabase/client";

export const FeedbackWidget = () => {
  const { feedbacks, loading } = useReceivedFeedbacks();
  const navigate = useNavigate();

  const goToTeamProfile = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      navigate(`/team/${data.user.id}`);
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
                  <img 
                    src={feedbacks[0].from_profile?.avatar || 'https://i.pravatar.cc/150'} 
                    alt={`${feedbacks[0].from_profile?.display_name || 'Usuário'} avatar`}
                    className="h-8 w-8 rounded-full mr-4"
                  />
                  <span className="text-base font-medium text-black dark:text-white mr-6">
                    {feedbacks[0].from_profile?.display_name || 'Usuário'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(feedbacks[0].created_at), {
                      addSuffix: true,
                      locale: pt
                    })}
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/team/${feedbacks[0].from_profile?.id}`)}
                  className="self-start px-8 py-3 rounded-full bg-white/80 dark:bg-white/10 text-black dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors"
                >
                  retribuir
                </button>
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
