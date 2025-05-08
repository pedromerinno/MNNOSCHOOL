
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  isSubmitting: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    const success = await onSubmit(content);
    if (success) {
      setContent('');
    }
  };

  return (
    <div className="flex gap-3">
      <Textarea 
        placeholder="Adicione seu comentário..." 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={!content.trim() || isSubmitting}
        size="icon"
        className="self-end h-10 w-10 rounded-full"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
