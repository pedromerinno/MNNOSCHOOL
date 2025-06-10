
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader } from "lucide-react";
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
  const [bucketReady, setBucketReady] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure bucket exists when component mounts
  useEffect(() => {
    const ensureBucketExists = async () => {
      try {
        setBucketError(null);
        
        // First, try to check if we can access the bucket by listing files
        const { error: testError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (!testError) {
          // Bucket exists and is accessible
          setBucketReady(true);
          return;
        }
        
        console.log(`Testing bucket access failed: ${testError.message}`);
        
        // If we can't access it, try to create it
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 2097152 // 2MB
        });
        
        if (createError) {
          if (createError.message.includes("duplicate key value") || 
              createError.message.includes("already exists")) {
            // Bucket already exists, that's fine
            console.log(`Bucket '${bucketName}' already exists`);
            setBucketReady(true);
          } else {
            console.error(`Error creating bucket '${bucketName}':`, createError);
            setBucketError(`Erro ao preparar sistema de upload: ${createError.message}`);
            setBucketReady(false);
          }
        } else {
          console.log(`Bucket '${bucketName}' created successfully!`);
          setBucketReady(true);
        }
      } catch (error: any) {
        console.error("Error ensuring bucket exists:", error);
        setBucketError(`Erro inesperado: ${error.message}`);
        setBucketReady(false);
      }
    };
    
    ensureBucketExists();
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
          console.error("Erro ao fazer upload:", error);
          throw error;
        }

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
    fileInputRef.current?.click();
  };

  const getDisplayMessage = () => {
    if (isUploading) {
      return "Enviando...";
    }
    
    if (bucketError) {
      return bucketError;
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

  return (
    <div className="space-y-2 w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer relative",
          isDragging
            ? "border-primary bg-primary/5"
            : bucketError
            ? "border-red-300 bg-red-50"
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
          disabled={isUploading || !bucketReady || !!bucketError}
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            bucketError ? "bg-red-100" : "bg-gray-100"
          )}>
            {isUploading ? (
              <Loader className="w-6 h-6 text-gray-600 animate-spin" />
            ) : (
              <Upload className={cn(
                "w-6 h-6",
                bucketError ? "text-red-600" : "text-gray-600"
              )} />
            )}
          </div>
          <div className="text-sm text-gray-500">
            <span className={cn(
              "font-medium",
              bucketError ? "text-red-600" : "text-primary"
            )}>
              {getDisplayMessage()}
            </span>
            {getSubMessage() && (
              <p className="text-xs text-gray-400 mt-1">
                {getSubMessage()}
              </p>
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
