import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Camera, Video } from "lucide-react";

interface MediaTypeSelectorProps {
  mediaType: "video" | "image";
  onMediaTypeChange: (value: "video" | "image") => void;
}

export const MediaTypeSelector = ({
  mediaType,
  onMediaTypeChange
}: MediaTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Tipo de Background</Label>
      <Select value={mediaType} onValueChange={onMediaTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o tipo de mídia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="video">
            <div className="flex items-center">
              <Video className="h-3.5 w-3.5 mr-2" />
              Vídeo
            </div>
          </SelectItem>
          <SelectItem value="image">
            <div className="flex items-center">
              <Camera className="h-3.5 w-3.5 mr-2" />
              Imagem
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Escolha entre usar um vídeo ou uma imagem como background da página de login
      </p>
    </div>
  );
};