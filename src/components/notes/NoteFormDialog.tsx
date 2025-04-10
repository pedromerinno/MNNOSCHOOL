
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Note } from '@/types/note';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pin } from "lucide-react";

interface NoteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { 
    id?: string; 
    title: string; 
    content?: string | null; 
    color?: string | null;
    pinned?: boolean | null;
  }) => Promise<void>;
  note?: Note;
}

// Array de cores disponíveis para as notas
const COLORS = [
  '#ffffff', // branco
  '#f8fafc', // slate-50
  '#fef2f2', // red-50
  '#fef9c3', // yellow-100
  '#ecfccb', // lime-100
  '#d1fae5', // emerald-100
  '#cffafe', // cyan-100
  '#e0f2fe', // light blue-100
  '#ede9fe', // violet-100
  '#fce7f3', // pink-100
];

export const NoteFormDialog: React.FC<NoteFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  note
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<string>('');
  const [color, setColor] = useState('#ffffff');
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setColor(note.color || '#ffffff');
      setPinned(note.pinned || false);
    } else {
      // Reset form quando for criar uma nova nota
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setPinned(false);
    }
  }, [note, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        id: note?.id,
        title: title.trim(),
        content: content.trim() || null,
        color,
        pinned
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{note ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da nota"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conteúdo da nota"
              className="min-h-[120px]"
            />
          </div>
          
          <div>
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COLORS.map((colorOption) => (
                <div 
                  key={colorOption}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    color === colorOption ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="pinned"
              checked={pinned}
              onCheckedChange={setPinned}
            />
            <Label htmlFor="pinned" className="flex items-center cursor-pointer">
              <Pin className="h-4 w-4 mr-1" /> Fixar nota
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
