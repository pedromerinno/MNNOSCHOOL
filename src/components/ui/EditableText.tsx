
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

  if (!isEditing) {
    return (
      <div
        className={`${className} ${canEdit ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-1 transition-colors' : ''}`}
        onDoubleClick={handleDoubleClick}
        title={canEdit ? 'Clique duas vezes para editar' : ''}
      >
        {value || placeholder}
      </div>
    );
  }

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="flex items-start gap-2">
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`${className} flex-1`}
        disabled={isSaving}
      />
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
