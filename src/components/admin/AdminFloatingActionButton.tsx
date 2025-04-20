
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";

const FAB_OPTIONS = [
  {
    label: "Novo Curso",
    action: () => {
      window.open("/admin?tab=allcourses", "_self");
    },
  },
  {
    label: "Novo Aviso",
    action: () => {
      window.open("/community", "_self"); // Ajuste este caminho se houver página específica para avisos
    },
  },
  {
    label: "Nova Discussão",
    action: () => {
      window.open("/community", "_self");
    },
  },
];

export const AdminFloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const { userProfile } = useAuth();

  if (!userProfile?.is_admin && !userProfile?.super_admin) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed z-50 bottom-6 right-6 bg-black hover:bg-black/90 text-white rounded-full size-14 flex items-center justify-center shadow-xl"
          size="icon"
          aria-label="Ações rápidas admin"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="w-56 p-2 space-y-2"
        sideOffset={16}
      >
        {FAB_OPTIONS.map((option, idx) => (
          <Button
            key={option.label}
            variant="ghost"
            className="w-full justify-start text-base font-medium"
            onClick={() => {
              setOpen(false);
              option.action();
            }}
          >
            {option.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
