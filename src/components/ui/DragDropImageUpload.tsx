
import React, { useState, useCallback, useRef } from "react";
import { Upload, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface DragDropImageUploadProps {
  value: string | undefined | null;
  onChange: (url: string) => void;
  objectPrefix?: string;
  bucketName?: string;
  storagePath?: string;
  className?: string;
  previewClassName?: string;
  label?: string;
}

export const DragDropImageUpload: React.FC<DragDropImageUploadProps> = ({
  value,
  onChange,
  objectPrefix = "company",
  bucketName = "company-assets",
  storagePath = "logos",
  className,
  previewClassName,
  label = "Arraste e solte sua imagem aqui ou clique para selecionar"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      setIsUploading(true);

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${objectPrefix}-${Date.now()}.${fileExt}`;
        const filePath = `${storagePath}/${fileName}`;

        // Upload to supabase storage
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        onChange(publicUrl);
        toast.success("Imagem enviada com sucesso!");
      } catch (error: any) {
        console.error("Erro ao enviar imagem:", error);
        toast.error(`Erro ao enviar imagem: ${error.message}`);
      } finally {
        setIsUploading(false);
        setIsDragging(false);
      }
    },
    [onChange, objectPrefix, bucketName, storagePath]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    },
    [processFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2 w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer relative",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          <div className="text-sm text-gray-500">
            {isUploading ? (
              <span className="flex items-center justify-center">
                <span className="loading mr-2"></span>
                Enviando...
              </span>
            ) : (
              <>
                <span className="font-medium text-primary">{label}</span>
                <p className="text-xs text-gray-400 mt-1">
                  SVG, PNG, JPG ou GIF (max. 2MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {value && (
        <div className={cn("border rounded-md p-2 bg-white", previewClassName)}>
          <div className="flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="max-h-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropImageUpload;
