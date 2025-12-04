import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EnhancedImageUploadProps {
  value: string | undefined | null;
  onChange: (url: string) => void;
  objectPrefix?: string;
  bucketName?: string;
  storagePath?: string;
  className?: string;
  label?: string;
  description?: string;
  maxSizeMB?: number;
  aspectRatio?: "square" | "wide" | "tall" | "auto";
}

export const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  value,
  onChange,
  objectPrefix = "company",
  bucketName = "company-assets",
  storagePath = "logos",
  className,
  label = "Logo da Empresa",
  description = "Faça upload do logo da sua empresa. Formatos aceitos: JPG, PNG, SVG (máx. 2MB)",
  maxSizeMB = 2,
  aspectRatio = "auto",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bucketReady, setBucketReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  // Check if bucket exists and is accessible
  useEffect(() => {
    const checkBucketAccess = async () => {
      try {
        const { error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (error) {
          console.warn(`Bucket access error for '${bucketName}':`, error);
          setBucketReady(false);
        } else {
          setBucketReady(true);
        }
      } catch (error: any) {
        console.error("Error checking bucket access:", error);
        setBucketReady(false);
      }
    };
    
    checkBucketAccess();
  }, [bucketName]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "wide":
        return "aspect-video";
      case "tall":
        return "aspect-[3/4]";
      default:
        return "aspect-auto";
    }
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`A imagem deve ter no máximo ${maxSizeMB}MB`);
        return;
      }

      if (!bucketReady) {
        toast.error("Sistema de armazenamento não está pronto. Tente novamente em instantes.");
        return;
      }

      setIsUploading(true);

      try {
        // Create preview before upload
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

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
        setPreviewUrl(publicUrl);
        toast.success("Imagem enviada com sucesso!");
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast.error(`Erro ao enviar imagem: ${error.message}`);
        setPreviewUrl(value || null);
      } finally {
        setIsUploading(false);
        setIsDragging(false);
      }
    },
    [onChange, objectPrefix, bucketName, storagePath, bucketReady, maxSizeMB, value]
  );

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
      e.target.value = '';
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    onChange("");
    fileInputRef.current?.value && (fileInputRef.current.value = '');
  }, [onChange]);

  const handleClick = () => {
    if (!bucketReady) {
      toast.error("Sistema de armazenamento ainda não está pronto. Aguarde um momento.");
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <label className="text-sm font-medium leading-none">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {previewUrl ? (
        <div className="relative group">
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border border-border bg-muted/30",
              getAspectRatioClass(),
              "max-h-[180px]"
            )}
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain p-3"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={isUploading || !bucketReady}
              >
                <Upload className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  <span className="text-sm text-white">Enviando...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
            "min-h-[140px] flex items-center justify-center",
            isUploading && "pointer-events-none opacity-60"
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
            disabled={isUploading || !bucketReady}
          />
          
          <div className="flex flex-col items-center justify-center text-center space-y-4 p-6">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enviando imagem...</p>
                  <p className="text-xs text-muted-foreground">Aguarde um momento</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-primary/10 p-3">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    <span className="text-primary hover:underline">Clique para fazer upload</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SVG, PNG, JPG ou GIF (máx. {maxSizeMB}MB)
                  </p>
                </div>
                {!bucketReady && (
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Preparando sistema de upload...
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImageUpload;
