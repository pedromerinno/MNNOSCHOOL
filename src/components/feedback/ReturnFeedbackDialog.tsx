
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import { FeedbackForm } from "../team/feedback/FeedbackForm";
import { UserProfile } from "@/hooks/useUsers";

interface ReturnFeedbackDialogProps {
  toUser: UserProfile;
  trigger?: React.ReactNode;
}

export const ReturnFeedbackDialog = ({ toUser, trigger }: ReturnFeedbackDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Reply className="h-4 w-4" />
            Retribuir feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Retribuir Feedback para {toUser.display_name}</DialogTitle>
        </DialogHeader>
        <FeedbackForm toUser={toUser} />
      </DialogContent>
    </Dialog>
  );
}
