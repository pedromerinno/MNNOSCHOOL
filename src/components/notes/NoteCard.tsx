
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pin, Pencil, Trash2 } from "lucide-react";
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean | null) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onDelete,
  onTogglePin
}) => {
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      onDelete(note.id);
    }
  };

  const formattedDate = format(new Date(note.updated_at), 'dd/MM/yyyy HH:mm');

  return (
    <Card 
      className={cn(
        "h-full transition-all hover:shadow-md relative overflow-hidden",
        note.pinned && "ring-2 ring-amber-400"
      )}
      style={{ 
        backgroundColor: note.color || undefined,
      }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: note.color || undefined, opacity: 0.7 }}
      />
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg line-clamp-1">{note.title}</h3>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              className={cn(
                "h-8 w-8",
                note.pinned && "text-amber-600"
              )}
              onClick={() => onTogglePin(note.id, note.pinned)}
              title={note.pinned ? "Desafixar" : "Fixar"}
            >
              <Pin className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onEdit(note)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:text-red-700" 
              onClick={handleDelete}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-grow mb-3">
          {note.content && (
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-6 text-sm">
              {note.content}
            </p>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-auto">
          {formattedDate}
        </div>
      </CardContent>
    </Card>
  );
};
