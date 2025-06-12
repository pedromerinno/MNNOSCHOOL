
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';
import { Check, X } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  canEdit?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  multiline = false,
  className = '',
  placeholder,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editValue.trim() !== value) {
      setIsSaving(true);
      try {
        await onSave(editValue.trim());
        
        // Dispatch evento para atualização imediata na playlist
        window.dispatchEvent(new CustomEvent('lesson-field-updated', {
          detail: {
            lessonId: 'current', // Será atualizado pelo componente pai
            field: 'title',
            value: editValue.trim()
          }
        }));
      } catch (error) {
        console.error('Error saving:', error);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Save automatically when clicking outside the field
    handleSave();
  };

  if (!isEditing) {
    return (
      <div
        className={`${className} ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors' : ''}`}
        onDoubleClick={handleDoubleClick}
        title={canEdit ? 'Clique duas vezes para editar' : ''}
      >
        {value || placeholder}
      </div>
    );
  }

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <InputComponent
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`${multiline ? 'min-h-[120px] text-center text-lg resize-none border-2 border-primary/20 focus:border-primary shadow-lg' : ''} w-full`}
          disabled={isSaving}
          placeholder={placeholder}
        />
      </div>
      <div className="flex justify-center gap-3 mt-4">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2"
        >
          <Check className="h-4 w-4" />
          Salvar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};
