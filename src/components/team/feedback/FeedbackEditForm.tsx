
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface FeedbackEditFormProps {
  initialContent: string;
  onCancel: () => void;
  onSave: (content: string) => Promise<void>;
}

export const FeedbackEditForm = ({ initialContent, onCancel, onSave }: FeedbackEditFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSave(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pl-11 space-y-2">
      <Textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] w-full"
      />
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          size="sm"
          onClick={handleSave}
          disabled={!content.trim() || isSubmitting}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
};
