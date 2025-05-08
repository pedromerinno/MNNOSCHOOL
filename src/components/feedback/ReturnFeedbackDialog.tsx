
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { FeedbackForm } from "../team/feedback/FeedbackForm";
import { UserProfile } from "@/hooks/useUsers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ReturnFeedbackDialogProps {
  toUser: UserProfile;
  trigger?: React.ReactNode;
}

export const ReturnFeedbackDialog = ({ toUser, trigger }: ReturnFeedbackDialogProps) => {
  // Extract first letter of display name for avatar fallback
  const getInitial = () => {
    if (toUser?.display_name) {
      return toUser.display_name.substring(0, 1).toUpperCase();
    }
    return null;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Retribuir feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-xl border-0 shadow-lg p-0 overflow-hidden bg-white dark:bg-gray-900">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-6 py-6">
          <DialogHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-sm">
              <AvatarImage src={toUser?.avatar || undefined} alt={toUser?.display_name || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {getInitial() || <MessageSquare className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <DialogTitle className="text-xl">Feedback para {toUser.display_name}</DialogTitle>
              <DialogDescription className="text-sm opacity-80">
                Compartilhe suas percepções de forma construtiva
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>
        <div className="p-6">
          <FeedbackForm toUser={toUser} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
