
import React, { useState, useMemo, useEffect } from "react";
import { Plus, FileText, Key, BookOpen, MessageSquare, Bell, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { NewCourseDialog, NewNoticeDialog, NewDiscussionDialog, NewFeedbackDialog, AddDocumentDialog } from "./dialogs";
import { CreateAccessDialog } from "@/components/access/CreateAccessDialog";

const ADMIN_FAB_OPTIONS = [{
  label: "Curso",
  icon: BookOpen,
  action: "openCourse" as const
}, {
  label: "Aviso",
  icon: Bell,
  action: "openNotice" as const
}, {
  label: "Feedback",
  icon: MessageSquare,
  action: "openFeedback" as const
}, {
  label: "Senha de Acesso",
  icon: Key,
  action: "openAccess" as const
}, {
  label: "Documento",
  icon: FileText,
  action: "openDocument" as const
}];


export const AdminFloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const { isAdmin, isLoading } = useIsAdmin();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [discussionDialogOpen, setDiscussionDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  
  // Only show admin options since button only appears for admins
  const availableOptions = useMemo(() => {
    return ADMIN_FAB_OPTIONS;
  }, []);
  
  
  // Don't render while loading to avoid flickering
  // Only render if user is admin of the selected company
  if (isLoading || !isAdmin) return null;
  
  const handleOption = (option: (typeof ADMIN_FAB_OPTIONS)[number]) => {
    setOpen(false);
    switch (option.action) {
      case "openCourse":
        setCourseDialogOpen(true);
        break;
      case "openNotice":
        setNoticeDialogOpen(true);
        break;
      case "openDiscussion":
        setDiscussionDialogOpen(true);
        break;
      case "openFeedback":
        setFeedbackDialogOpen(true);
        break;
      case "openAccess":
        setAccessDialogOpen(true);
        break;
      case "openDocument":
        setDocumentDialogOpen(true);
        break;
    }
  };
  
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" aria-label="Ações rápidas admin" className="fixed z-50 bottom-6 right-6 bg-black hover:bg-black/90 text-white rounded-full size-11 flex items-center justify-center shadow-xl text-base">
            <Plus className="w-8 h-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-64 p-4 space-y-2 rounded-2xl" sideOffset={16}>
          {availableOptions.map(option => {
            const IconComponent = option.icon;
            return (
              <Button 
                key={option.label} 
                variant="ghost" 
                className="w-full !justify-start text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors" 
                onClick={() => handleOption(option)}
              >
                <IconComponent className="h-5 w-5 mr-3" strokeWidth={2} />
                {option.label}
              </Button>
            );
          })}
        </PopoverContent>
      </Popover>
      <NewCourseDialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen} />
      <NewNoticeDialog open={noticeDialogOpen} onOpenChange={setNoticeDialogOpen} />
      <NewDiscussionDialog open={discussionDialogOpen} onOpenChange={setDiscussionDialogOpen} />
      <NewFeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />
      <CreateAccessDialog 
        open={accessDialogOpen} 
        onOpenChange={setAccessDialogOpen}
        onAccessUpdated={() => {
          window.dispatchEvent(new CustomEvent('access-created'));
        }}
      />
      <AddDocumentDialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen} />
    </>
  );
};
