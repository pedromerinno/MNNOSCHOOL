import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";

interface UrlInputProps {
  mediaUrl: string;
  mediaType: "video" | "image";
  onUrlChange: (value: string) => void;
}

export const UrlInput = ({ mediaUrl, mediaType, onUrlChange }: UrlInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="mediaUrl" className="text-sm font-medium flex items-center gap-2">
        <Link2 className="h-3.5 w-3.5" />
        Ou insira uma URL
      </Label>
      <Input
        id="mediaUrl"
        type="url"
        value={mediaUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder={mediaType === 'video' 
          ? "https://exemplo.com/video.mp4" 
          : "https://exemplo.com/imagem.jpg"}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        {mediaType === 'video' 
          ? 'Insira a URL completa de um vídeo (MP4, WebM, MOV) ou faça upload de um arquivo' 
          : 'Insira a URL completa de uma imagem (JPG, PNG, GIF, WebP) ou faça upload de um arquivo'}
      </p>
    </div>
  );
};
