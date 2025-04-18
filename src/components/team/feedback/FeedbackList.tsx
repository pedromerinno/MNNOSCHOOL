
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackProfile {
  id: string;
  display_name: string | null;
  avatar: string | null;
}

interface Feedback {
  id: string;
  content: string;
  created_at: string;
  from_user_id: string;
  from_profile?: FeedbackProfile | null;
}

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export const FeedbackList = ({ feedbacks }: FeedbackListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Received Feedbacks</CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              No feedback received yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start space-x-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {feedback.from_profile?.display_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                    {feedback.from_profile?.avatar && (
                      <AvatarImage src={feedback.from_profile.avatar} alt={feedback.from_profile.display_name || ''} />
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{feedback.from_profile?.display_name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(feedback.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-11">{feedback.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
