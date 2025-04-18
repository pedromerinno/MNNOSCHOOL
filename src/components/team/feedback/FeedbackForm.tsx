
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

interface FeedbackFormProps {
  memberName: string | null;
  onSubmit: (feedback: string) => Promise<void>;
  isSubmitting: boolean;
}

export const FeedbackForm = ({ memberName, onSubmit, isSubmitting }: FeedbackFormProps) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    await onSubmit(feedback);
    setFeedback("");
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Send Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder={`Write your feedback for ${memberName}...`}
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
            Send Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
