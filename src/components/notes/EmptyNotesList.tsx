
import React from 'react';
import { Button } from "@/components/ui/button";
import { StickyNote, Plus } from "lucide-react";

interface EmptyNotesListProps {
  onAddNote: () => void;
}

export const EmptyNotesList: React.FC<EmptyNotesListProps> = ({ onAddNote }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
        <StickyNote className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium mb-2 dark:text-white">Sem notas</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        Você ainda não criou nenhuma nota. Crie sua primeira nota para começar a organizar suas ideias e informações.
      </p>
      <Button onClick={onAddNote}>
        <Plus className="h-4 w-4 mr-2" />
        Nova nota
      </Button>
    </div>
  );
};
