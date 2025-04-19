import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Trash2, Check } from "lucide-react";
import { Discussion as DiscussionType } from "@/types/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompanies } from "@/hooks/useCompanies";

interface DiscussionProps {
  discussion: DiscussionType;
  onView: (discussion: DiscussionType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'open' | 'closed') => void;
  index: number;
  totalCount: number;
}

export const Discussion: React.FC<DiscussionProps> = ({
  discussion,
  onView,
  onDelete,
  onToggleStatus,
  index,
  totalCount
}) => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  
  const isAdmin = userProfile?.isAdmin === true;
  const isAuthor = userProfile?.id && discussion.author_id === userProfile.id;

  const participantsCount = new Set(
    discussion.discussion_replies.map((reply) => reply.author_id)
  ).size;

  const authorName = discussion.profiles?.display_name || 'Usuário';
  const authorAvatar = discussion.profiles?.avatar;

  // Calculate the inverted number (oldest = #1)
  const discussionNumber = totalCount - index;

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow border-l-4",
      discussion.status === 'closed' 
        ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10" 
        : `border-l-[${companyColor}]`
    )}
    style={{
      borderLeftColor: discussion.status === 'closed' ? 'rgb(34 197 94)' : companyColor
    }}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500 font-medium">#{discussionNumber}</span>
              <h3 className="font-medium text-lg dark:text-white">{discussion.title}</h3>
              {discussion.status === 'closed' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Resolvida
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
              {discussion.content}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={authorAvatar || undefined} />
                  <AvatarFallback style={{ backgroundColor: `${companyColor}20`, color: companyColor }}>
                    {authorName ? authorName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 font-medium">{authorName}</span>
              </div>
              <span className="text-sm text-gray-500">{format(new Date(discussion.created_at), 'dd/MM/yyyy')}</span>
              <div className="flex items-center text-sm text-gray-500 gap-4">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{discussion.discussion_replies.length}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{participantsCount}</span>
                </div>
              </div>
            </div>
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
              style={{ 
                color: companyColor,
              }}
              className="hover:bg-opacity-10 hover:bg-black"
            >
              Ver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
