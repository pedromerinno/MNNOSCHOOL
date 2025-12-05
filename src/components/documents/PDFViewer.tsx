import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { toast } from 'sonner';

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  const workerPath = '/pdf.worker.min.mjs';
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
}

interface PDFViewerProps {
  url: string;
  fileName?: string;
  onDownload?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName, onDownload }) => {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPDF();
  }, [url]);

  useEffect(() => {
    if (pdf && currentPage) {
      renderPage();
    }
  }, [pdf, currentPage, scale, rotation]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar o PDF
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao carregar PDF');
      }

      const arrayBuffer = await response.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Erro ao carregar PDF:', err);
      setError(err.message || 'Erro ao carregar PDF');
      toast.error('Erro ao carregar PDF');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale, rotation });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Erro ao renderizar página:', err);
      toast.error('Erro ao renderizar página');
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={loadPDF} variant="outline" size="sm">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8"
            title="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300 px-2 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="h-8"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
            className="h-8"
            title="Rotacionar"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="h-8"
              title="Baixar PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-start justify-center"
      >
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded border border-gray-200 dark:border-gray-700 bg-white"
        />
      </div>
    </div>
  );
};




