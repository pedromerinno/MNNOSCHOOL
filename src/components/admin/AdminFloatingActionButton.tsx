
import React, { useState } from "react";
import { Plus, FilePlus, Link, BookPlus, MessageSquarePlus, BellPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { NewCourseDialog, NewNoticeDialog, NewDiscussionDialog, NewAccessDialog, AddDocumentDialog } from "./dialogs";

const FAB_OPTIONS = [{
  label: "Novo Curso",
  icon: <BookPlus className="h-5 w-5 mr-2" />,
  action: "openCourse" as const
}, {
  label: "Novo Aviso",
  icon: <BellPlus className="h-5 w-5 mr-2" />,
  action: "openNotice" as const
}, {
  label: "Nova Discussão",
  icon: <MessageSquarePlus className="h-5 w-5 mr-2" />,
  action: "openDiscussion" as const
}, {
  label: "Nova Senha de Acesso",
  icon: <Link className="h-5 w-5 mr-2" />,
  action: "openAccess" as const
}, {
  label: "Novo Documento",
  icon: <FilePlus className="h-5 w-5 mr-2" />,
  action: "openDocument" as const
}];

export const AdminFloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const { isAdmin, isLoading } = useIsAdmin();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [noticeDialogOpen, setNoticeDialogOpen] = useState(false);
  const [discussionDialogOpen, setDiscussionDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  
  // Only render for admin or super_admin users
  // Don't render while loading to avoid flickering
  if (isLoading || !isAdmin) return null;
  
  const handleOption = (option: (typeof FAB_OPTIONS)[number]) => {
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
      case "openAccess":
        setAccessDialogOpen(true);
        break;
      case "openDocument":
        setDocumentDialogOpen(true);
        break;
    }
  };
  
  return <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" aria-label="Ações rápidas admin" className="fixed z-50 bottom-6 right-6 bg-black hover:bg-black/90 text-white rounded-full size-11 flex items-center justify-center shadow-xl text-base">
            <Plus className="w-8 h-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-64 p-2 space-y-1" sideOffset={16}>
          {FAB_OPTIONS.map(option => <Button key={option.label} variant="ghost" className="w-full !justify-start text-xs font-medium py-1.5 px-2" style={{
          fontSize: "0.85rem"
        }} onClick={() => handleOption(option)}>
              {option.icon}
              {option.label}
            </Button>)}
        </PopoverContent>
      </Popover>
      <NewCourseDialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen} />
      <NewNoticeDialog open={noticeDialogOpen} onOpenChange={setNoticeDialogOpen} />
      <NewDiscussionDialog open={discussionDialogOpen} onOpenChange={setDiscussionDialogOpen} />
      <NewAccessDialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen} />
      <AddDocumentDialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen} />
    </>;
};
