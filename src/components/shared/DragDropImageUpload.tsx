
import React, { useState, useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DragDropImageUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
  objectPrefix?: string;
  storageBucket?: string;
  className?: string;
  companyName?: string;
}

export const DragDropImageUpload: React.FC<DragDropImageUploadProps> = ({
  value,
  onChange,
  objectPrefix = 'logos',
  storageBucket = 'company-assets',
  className = '',
  companyName
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a unique file name using timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${(companyName || "company").replace(/\s+/g, "-").toLowerCase()}-logo-${Date.now()}.${fileExt}`;
      const filePath = `${objectPrefix}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(filePath);
      
      // Update with the new URL
      onChange(publicUrl);
      toast.success("Imagem enviada com sucesso");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      
      if (error.message?.includes("storage/bucket-not-found")) {
        toast.error("Sistema de armazenamento não configurado. Contate o administrador.");
      } else {
        toast.error(`Erro ao enviar imagem: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer
          ${isDragging ? 'bg-primary/10 border-primary' : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input 
          id="file-upload"
          type="file" 
          accept="image/*"
          className="hidden" 
          onChange={handleInputChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isDragging ? 'bg-primary/20' : 'bg-gray-200'}`}>
            <Upload className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-gray-500'}`} />
          </div>
          
          <p className="font-medium text-sm">
            {isUploading ? 'Enviando...' : (
              <>
                <span className="text-primary font-semibold">Clique para enviar</span> ou arraste e solte
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 text-center">
            Formatos suportados: PNG, JPG, GIF (max. 5MB)
          </p>
        </div>
      </div>
      
      {value && (
        <div className="border rounded-md p-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img 
              src={value}
              alt="Logo preview" 
              className="h-10 w-10 object-contain rounded"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">Logo da empresa</span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{value.split('/').pop()}</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            Alterar
          </Button>
        </div>
      )}
      
      {!value && !isUploading && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="text-xs text-gray-500">ou</span>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>
      )}
      
      {!value && !isUploading && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://exemplo.com/logo.png"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
