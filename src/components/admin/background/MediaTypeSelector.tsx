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
  return <div className="space-y-2 py-0">
      <Label className="py-0">Tipo de Background</Label>
      <Select value={mediaType} onValueChange={onMediaTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de mídia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="video">
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-2" /> Vídeo
            </div>
          </SelectItem>
          <SelectItem value="image">
            <div className="flex items-center">
              <Camera className="h-4 w-4 mr-2" /> Imagem
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>;
};