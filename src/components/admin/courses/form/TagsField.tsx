
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "./CourseFormTypes";

interface TagsFieldProps {
  form: UseFormReturn<CourseFormValues>;
}

export const TagsField: React.FC<TagsFieldProps> = ({ form }) => {
  const [tagInput, setTagInput] = useState<string>("");

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags (para quem o curso é recomendado)</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {field.value?.map((tag) => (
              <Badge key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)} 
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="designer, motion, developer..."
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addTag}
            >
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pressione Enter ou clique em "Adicionar" para incluir uma tag
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
