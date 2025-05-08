
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const { 
    comments, 
    loading, 
    connectionError, 
    submitting, 
    submitComment 
  } = useComments(lessonId);

  // Don't show schema-related errors to users
  const shouldShowError = connectionError && 
    typeof connectionError === 'string' && 
    !connectionError.includes('schema') && 
    !connectionError.includes('relationship');

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="border-b border-border bg-muted/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Comentários
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {shouldShowError && (
          <div className="mb-4 p-2 border border-amber-200 bg-amber-50 text-amber-700 rounded-md flex items-center gap-2 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-500">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Problema de conexão detectado. Alguns recursos podem estar limitados.</span>
          </div>
        )}
        
        <div className="mb-8">
          <CommentForm onSubmit={submitComment} isSubmitting={submitting} />
        </div>

        <div className="space-y-6">
          <CommentList comments={comments} loading={loading} />
        </div>
      </CardContent>
    </Card>
  );
};
