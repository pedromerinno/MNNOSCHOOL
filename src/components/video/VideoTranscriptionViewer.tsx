import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface VideoTranscriptionViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle: string;
  transcription: string;
}

export const VideoTranscriptionViewer: React.FC<VideoTranscriptionViewerProps> = ({
  isOpen,
  onOpenChange,
  videoTitle,
  transcription,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Filtrar transcrição baseado na busca
  const filteredTranscription = useMemo(() => {
    if (!searchQuery.trim()) {
      return transcription;
    }

    const query = searchQuery.toLowerCase();
    const sentences = transcription.split(/[.!?]\s+/);
    
    return sentences
      .filter(sentence => sentence.toLowerCase().includes(query))
      .join('. ');
  }, [transcription, searchQuery]);

  // Destacar termos da busca
  const highlightedText = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredTranscription;
    }

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return filteredTranscription.split(regex).map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  }, [filteredTranscription, searchQuery]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      toast.success('Transcrição copiada para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar transcrição');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transcrição: {videoTitle}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="ml-4"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Transcrição completa do vídeo. Use a busca para encontrar trechos específicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar na transcrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Área de transcrição */}
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {searchQuery.trim() ? (
                <p className="whitespace-pre-wrap">{highlightedText}</p>
              ) : (
                <p className="whitespace-pre-wrap">{transcription}</p>
              )}
            </div>
          </ScrollArea>

          {searchQuery.trim() && (
            <div className="text-sm text-gray-500">
              {filteredTranscription.split(/[.!?]\s+/).length} trecho(s) encontrado(s)
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

