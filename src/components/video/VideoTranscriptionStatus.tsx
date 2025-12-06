import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import { TranscriptionStatus } from '@/services/video/transcriptionService';
import { cn } from '@/lib/utils';

interface VideoTranscriptionStatusProps {
  status: TranscriptionStatus;
  error?: string | null;
  onRetry?: () => void;
  onView?: () => void;
  className?: string;
}

const statusConfig: Record<TranscriptionStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    variant: 'outline',
    className: 'text-gray-600',
  },
  processing: {
    label: 'Processando',
    icon: Loader2,
    variant: 'secondary',
    className: 'text-blue-600 animate-spin',
  },
  completed: {
    label: 'Transcrito',
    icon: CheckCircle2,
    variant: 'default',
    className: 'text-green-600',
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    variant: 'destructive',
    className: 'text-red-600',
  },
};

export const VideoTranscriptionStatus: React.FC<VideoTranscriptionStatusProps> = ({
  status,
  error,
  onRetry,
  onView,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={config.variant} className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', config.className)} />
        <span>{config.label}</span>
      </Badge>

      {status === 'completed' && onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="h-7 px-2 text-xs"
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          Ver transcrição
        </Button>
      )}

      {status === 'failed' && onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Tentar novamente
        </Button>
      )}

      {error && status === 'failed' && (
        <span className="text-xs text-red-600 max-w-xs truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
};

