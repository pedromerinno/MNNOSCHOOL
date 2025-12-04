import { Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPreviewProps {
  mediaUrl: string;
  mediaType: "video" | "image";
}

export const MediaPreview = ({ mediaUrl, mediaType }: MediaPreviewProps) => {
  if (!mediaUrl) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <h4 className="text-xs font-medium">Pré-visualização</h4>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(mediaUrl, '_blank')}
          className="gap-1.5 text-xs h-7"
        >
          <ExternalLink className="h-3 w-3" />
          Abrir em nova aba
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden bg-muted/30">
        <div className="aspect-video relative">
          {mediaType === 'video' ? (
            <video 
              src={mediaUrl} 
              controls 
              className="w-full h-full object-contain" 
              preload="metadata"
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Preview do background" 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          )}
        </div>
      </div>
      <div className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-md">
        <p className="font-medium mb-1 text-xs">URL do arquivo:</p>
        <p className="break-all font-mono text-xs">{mediaUrl}</p>
      </div>
    </div>
  );
};
