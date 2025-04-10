import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteFormDialog } from '@/components/notes/NoteFormDialog';
import { EmptyNotesList } from '@/components/notes/EmptyNotesList';
import { Note } from '@/types/note';
import { Skeleton } from '@/components/ui/skeleton';

const Notes = () => {
  const { notes, isLoading, addNote, updateNote, deleteNote, togglePinned } = useNotes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);

  const handleAddNote = () => {
    setSelectedNote(undefined);
    setIsDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
  };

  const handleSaveNote = async (noteData: {
    id?: string;
    title: string;
    content?: string | null;
    color?: string | null;
    pinned?: boolean | null;
  }) => {
    if (noteData.id) {
      // Edição de nota existente
      const { id, ...updates } = noteData;
      await updateNote(id, updates);
    } else {
      // Adição de nova nota
      await addNote(
        noteData.title,
        noteData.content || undefined,
        noteData.color || undefined,
        noteData.pinned || undefined
      );
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (notes.length === 0) {
      return <EmptyNotesList onAddNote={handleAddNote} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEditNote}
            onDelete={deleteNote}
            onTogglePin={togglePinned}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie e gerencie suas notas pessoais para se manter organizado
          </p>
        </div>
        
        <Button
          onClick={handleAddNote}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center mt-4 md:mt-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Nota
        </Button>
      </div>

      {renderContent()}

      <NoteFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveNote}
        note={selectedNote}
      />
    </div>
  );
};

export default Notes;
