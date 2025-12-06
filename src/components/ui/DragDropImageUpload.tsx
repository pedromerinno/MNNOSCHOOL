
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [bucketReady, setBucketReady] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if bucket exists and is accessible
  useEffect(() => {
    const checkBucketAccess = async () => {
      try {
        setBucketError(null);
        
        // Try to list files in the bucket to verify access
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (error) {
          console.warn(`Bucket access error for '${bucketName}':`, error);
          setBucketError(`Erro ao acessar sistema de upload: ${error.message}`);
          setBucketReady(false);
        } else {
          console.log(`Bucket '${bucketName}' is accessible`);
          setBucketReady(true);
        }
      } catch (error: any) {
        console.error("Error checking bucket access:", error);
        setBucketError(`Erro inesperado: ${error.message}`);
        setBucketReady(false);
      }
    };
    
    checkBucketAccess();
  }, [bucketName]);

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

      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        return;
      }

      if (!bucketReady) {
        toast.error("Sistema de armazenamento não está pronto. Tente novamente em instantes.");
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

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        onChange(publicUrl);
        toast.success("Imagem enviada com sucesso!");
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast.error(`Erro ao enviar imagem: ${error.message}`);
      } finally {
        setIsUploading(false);
        setIsDragging(false);
      }
    },
    [onChange, objectPrefix, bucketName, storagePath, bucketReady]
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
    if (!bucketReady && !bucketError) {
      toast.error("Sistema de armazenamento ainda não está pronto. Aguarde um momento.");
      return;
    }
    
    if (bucketError) {
      toast.error("Sistema de armazenamento não está disponível. Tente recarregar a página.");
      return;
    }
    
    fileInputRef.current?.click();
  };

  const getDisplayMessage = () => {
    if (isUploading) {
      return "Enviando...";
    }
    
    if (bucketError) {
      return "Sistema de upload indisponível";
    }
    
    if (!bucketReady) {
      return "Preparando sistema de upload...";
    }
    
    return label;
  };

  const getSubMessage = () => {
    if (isUploading || bucketError || !bucketReady) {
      return null;
    }
    
    return "SVG, PNG, JPG ou GIF (max. 2MB)";
  };

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    toast.success("Imagem removida");
  }, [onChange]);

  // Se já tem imagem, mostrar preview grande
  if (value) {
    return (
      <div className={cn("space-y-3 w-full", className)}>
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                  <span className="text-white text-sm font-medium">Enviando...</span>
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : bucketError
              ? "border-red-300 bg-red-50"
              : "border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50"
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
            disabled={isUploading || !bucketReady || !!bucketError}
          />
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">
              {isUploading ? "Enviando..." : "Clique ou arraste para substituir"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem imagem, mostrar área de upload
  return (
    <div className={cn("space-y-2 w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer relative group",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : bucketError
            ? "border-red-300 bg-red-50"
            : bucketReady
            ? "border-gray-300 hover:border-primary hover:bg-primary/5"
            : "border-gray-200 bg-gray-100",
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
          disabled={isUploading || !bucketReady || !!bucketError}
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragging
              ? "bg-primary/10"
              : bucketError
              ? "bg-red-100"
              : "bg-gray-100 group-hover:bg-primary/10"
          )}>
            {isUploading ? (
              <Loader className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragging
                  ? "text-primary"
                  : bucketError
                  ? "text-red-600"
                  : "text-gray-600 group-hover:text-primary"
              )} />
            )}
          </div>
          <div className="space-y-1">
            <span className={cn(
              "text-base font-medium block",
              isDragging
                ? "text-primary"
                : bucketError
                ? "text-red-600"
                : "text-gray-700"
            )}>
              {getDisplayMessage()}
            </span>
            {getSubMessage() && (
              <p className="text-sm text-gray-500">
                {getSubMessage()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropImageUpload;
