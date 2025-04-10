
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setNotes(data as Note[]);
    } catch (error: any) {
      console.error('Erro ao buscar notas:', error);
      toast.error(`Erro ao carregar notas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addNote = useCallback(async (
    title: string,
    content?: string,
    color?: string,
    pinned?: boolean
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar notas');
      return null;
    }

    try {
      const newNote = {
        title,
        content: content || null,
        color: color || '#ffffff',
        pinned: pinned || false,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('user_notes')
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data as Note, ...prev]);
      toast.success('Nota adicionada com sucesso');
      return data as Note;
    } catch (error: any) {
      console.error('Erro ao adicionar nota:', error);
      toast.error(`Erro ao adicionar nota: ${error.message}`);
      return null;
    }
  }, [user]);

  const updateNote = useCallback(async (
    id: string,
    updates: {
      title?: string;
      content?: string | null;
      color?: string | null;
      pinned?: boolean | null;
    }
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => 
        prev.map(note => 
          note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
        )
      );
      
      toast.success('Nota atualizada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar nota:', error);
      toast.error(`Erro ao atualizar nota: ${error.message}`);
      return false;
    }
  }, [user]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Nota excluída com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir nota:', error);
      toast.error(`Erro ao excluir nota: ${error.message}`);
      return false;
    }
  }, [user]);

  const togglePinned = useCallback(async (id: string, currentPinned: boolean | null) => {
    return updateNote(id, { pinned: !(currentPinned || false) });
  }, [updateNote]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    togglePinned,
    refreshNotes: fetchNotes
  };
};
