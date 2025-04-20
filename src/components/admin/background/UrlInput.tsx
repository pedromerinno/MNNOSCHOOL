
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UrlInputProps {
  mediaUrl: string;
  mediaType: "video" | "image";
  onUrlChange: (value: string) => void;
}

export const UrlInput = ({ mediaUrl, mediaType, onUrlChange }: UrlInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="mediaUrl">Ou insira uma URL</Label>
      <Input
        id="mediaUrl"
        type="url"
        value={mediaUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder={mediaType === 'video' 
          ? "https://exemplo.com/video.mp4" 
          : "https://exemplo.com/imagem.jpg"}
      />
      <p className="text-sm text-gray-500">
        {mediaType === 'video' 
          ? 'Insira a URL de um vídeo MP4 ou faça upload' 
          : 'Insira a URL de uma imagem ou faça upload'}
      </p>
    </div>
  );
};
