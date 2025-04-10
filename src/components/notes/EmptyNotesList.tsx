
import React from 'react';
import { Button } from "@/components/ui/button";

interface EmptyNotesListProps {
  onAddNote: () => void;
}

export const EmptyNotesList: React.FC<EmptyNotesListProps> = ({ onAddNote }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-xl font-medium mb-2 dark:text-white">Sem notas</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        Você ainda não criou nenhuma nota. Crie sua primeira nota para começar a organizar suas ideias e informações.
      </p>
      <Button onClick={onAddNote}>
        Nova nota
      </Button>
    </div>
  );
};

