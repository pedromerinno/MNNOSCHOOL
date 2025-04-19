
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Trash2, Check, Image } from "lucide-react";
import { Discussion as DiscussionType } from "@/types/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DiscussionProps {
  discussion: DiscussionType;
  onView: (discussion: DiscussionType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'open' | 'closed') => void;
}

export const Discussion: React.FC<DiscussionProps> = ({
  discussion,
  onView,
  onDelete,
  onToggleStatus,
}) => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.isAdmin === true;
  const isAuthor = userProfile?.id && discussion.author_id === userProfile.id;

  const participantsCount = new Set(
    discussion.discussion_replies.map((reply) => reply.author_id)
  ).size;

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow border-l-4",
      discussion.status === 'closed' 
        ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10" 
        : "border-l-blue-500"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-lg dark:text-white">{discussion.title}</h3>
              {discussion.status === 'closed' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Concluída
                </span>
              )}
            </div>
            {discussion.image_url && (
              <div className="my-4">
                <img 
                  src={discussion.image_url} 
                  alt={discussion.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
              {discussion.content}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {(isAdmin || isAuthor) && (
              <>
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
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      discussion.status === 'closed'
                        ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                        : "text-green-500 hover:text-green-700 hover:bg-green-50"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(discussion.id, discussion.status === 'closed' ? 'open' : 'closed');
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </>
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
