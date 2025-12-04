import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  mediaType: "video" | "image";
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const FileUpload = ({
  mediaType,
  onFileUpload,
  isUploading
}: FileUploadProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Upload de Arquivo
      </Label>
      <div className="relative">
        <div className="flex items-center gap-3">
          <label
            htmlFor="file-upload"
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-sm",
              "hover:bg-accent hover:border-primary",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Upload className={cn("h-3.5 w-3.5", isUploading && "animate-pulse")} />
            <span className="font-medium">
              {isUploading ? "Enviando..." : "Selecionar arquivo"}
            </span>
          </label>
          <Input
            id="file-upload"
            type="file"
            accept={mediaType === 'video' ? 'video/*' : 'image/*'}
            onChange={onFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Processando...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {mediaType === 'video' 
            ? 'Formatos suportados: MP4, WebM, MOV' 
            : 'Formatos suportados: JPG, PNG, GIF, WebP'}
        </p>
      </div>
    </div>
  );
};