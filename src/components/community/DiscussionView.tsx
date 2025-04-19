
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Trash2 } from "lucide-react";
import { Discussion, DiscussionReply } from "@/types/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface DiscussionViewProps {
  discussion: Discussion | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: (discussionId: string, content: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  discussion,
  isOpen,
  onOpenChange,
  onReply,
  onDeleteReply,
}) => {
  const { userProfile } = useAuth();
  const [replyContent, setReplyContent] = React.useState("");
  const isAdmin = userProfile?.isAdmin === true;

  const handleSubmitReply = async () => {
    if (!discussion || !replyContent.trim()) return;
    await onReply(discussion.id, replyContent);
    setReplyContent("");
  };

  if (!discussion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{discussion.title}</DialogTitle>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <span className="mr-2">por {discussion.profiles?.display_name}</span>
            <span className="mx-2">•</span>
            <span>{format(new Date(discussion.created_at), 'dd/MM/yyyy')}</span>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {discussion.content}
          </p>
        </div>
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">
            Respostas ({discussion.discussion_replies.length})
          </h4>
          {discussion.discussion_replies.length === 0 ? (
            <div className="text-center py-6">
              <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Ainda não há respostas para esta discussão.</p>
              <p className="text-gray-500 text-sm mt-1">Seja o primeiro a responder!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussion.discussion_replies.map((reply) => (
                <div key={reply.id} className="relative bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {(isAdmin || (userProfile && reply.author_id === userProfile.id)) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 h-auto"
                      onClick={() => onDeleteReply(reply.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {reply.profiles?.display_name}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{format(new Date(reply.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pr-6">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4">
          <Textarea 
            placeholder="Escreva sua resposta..." 
            rows={3}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSubmitReply}>Responder</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
