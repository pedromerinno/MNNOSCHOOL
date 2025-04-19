
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Trash2 } from "lucide-react";
import { Discussion as DiscussionType } from "@/types/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface DiscussionProps {
  discussion: DiscussionType;
  onView: (discussion: DiscussionType) => void;
  onDelete: (id: string) => void;
}

export const Discussion: React.FC<DiscussionProps> = ({
  discussion,
  onView,
  onDelete,
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.isAdmin === true;
  const isAuthor = userProfile?.id && discussion.author_id === userProfile.id;

  const participantsCount = new Set(
    discussion.discussion_replies.map((reply) => reply.author_id)
  ).size;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg dark:text-white">{discussion.title}</h3>
          <div className="flex items-center gap-2">
            {(isAdmin || isAuthor) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(discussion.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onView(discussion)}
            >
              Ver
            </Button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
          {discussion.content}
        </p>
        <div className="flex items-center mt-3 text-xs text-gray-500">
          <span className="mr-2">por {discussion.profiles?.display_name}</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(discussion.created_at), 'dd/MM/yyyy')}</span>
        </div>
        <div className="flex mt-3 text-sm text-gray-500">
          <div className="flex items-center mr-4">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{discussion.discussion_replies.length} respostas</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{participantsCount} participantes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
