
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { HtmlContent } from "./HtmlContent";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  canEdit?: boolean;
  maxLength?: number;
  renderAsHtml?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  placeholder = "Clique duas vezes para editar...",
  multiline = false,
  className = "",
  canEdit = true,
  maxLength,
  renderAsHtml = false
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
    if (!canEdit) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
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
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    
    return (
      <div className="space-y-2">
        <InputComponent
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={`${className} focus:ring-2 focus:ring-blue-500`}
          placeholder={placeholder}
          rows={multiline ? 4 : undefined}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 px-2"
          >
            {isSaving ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-7 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        {multiline && (
          <p className="text-xs text-muted-foreground">
            Pressione Ctrl+Enter para salvar ou Esc para cancelar
          </p>
        )}
      </div>
    );
  }

  const displayValue = value || placeholder;
  const isEmpty = !value;

  return (
    <div
      className={`
        group relative cursor-pointer transition-all duration-200
        ${canEdit ? 'hover:bg-muted/50 rounded-md p-2 -m-2' : ''}
        ${isEmpty ? 'text-muted-foreground italic' : ''}
        ${className}
      `}
      onDoubleClick={handleDoubleClick}
      title={canEdit ? "Clique duas vezes para editar" : undefined}
    >
      {renderAsHtml && !isEmpty ? (
        <HtmlContent content={displayValue} />
      ) : (
        <div className={multiline ? 'whitespace-pre-wrap' : 'truncate'}>
          {displayValue}
        </div>
      )}
      
      {canEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute -top-1 -right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};
