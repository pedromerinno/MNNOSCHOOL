
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackItem } from "./FeedbackItem";
import { useFeedbackState } from "./useFeedbackState";
import { FeedbackListProps } from "./types";

export const FeedbackList = ({ feedbacks: initialFeedbacks }: FeedbackListProps) => {
  const {
    feedbacks,
    editingFeedbackId,
    editContent,
    isSubmitting,
    setEditContent,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDeleteFeedback
  } = useFeedbackState(initialFeedbacks);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedbacks Recebidos</CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum feedback recebido ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <FeedbackItem
                key={feedback.id}
                feedback={feedback}
                editingFeedbackId={editingFeedbackId}
                editContent={editContent}
                isSubmitting={isSubmitting}
                onEditContentChange={setEditContent}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteFeedback}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
