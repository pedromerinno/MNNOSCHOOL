
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
}

export const DocumentPreview = ({ open, onOpenChange, url }: DocumentPreviewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        {url && (
          <iframe
            src={url}
            className="w-full h-full"
            title="Document preview"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
