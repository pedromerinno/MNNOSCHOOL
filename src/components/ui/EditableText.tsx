
import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Textarea } from './textarea';

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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        <InputComponent
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`${multiline ? 'min-h-[60px] text-center text-[40px] font-normal leading-[1.1] resize-none border-none bg-transparent focus:border-none focus:ring-0 focus:outline-none shadow-none p-0' : ''} w-full ${className}`}
          disabled={isSaving}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
