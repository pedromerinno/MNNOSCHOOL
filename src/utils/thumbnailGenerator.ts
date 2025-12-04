/**
 * Utilitário para gerar thumbnails de documentos
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker do PDF.js
// Usar worker local da pasta public (mais confiável)
if (typeof window !== 'undefined') {
  // Worker local copiado para public/pdf.worker.min.mjs
  // Forçar configuração antes de qualquer uso
  const workerPath = '/pdf.worker.min.mjs';
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
  
  // Verificar se foi configurado corretamente
  if (pdfjsLib.GlobalWorkerOptions.workerSrc !== workerPath) {
    console.warn('[PDF.js] Worker não foi configurado corretamente, tentando novamente...');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
  }
  
  console.log('[PDF.js] Worker configurado (local):', pdfjsLib.GlobalWorkerOptions.workerSrc);
  console.log('[PDF.js] Versão do pdfjs-dist:', pdfjsLib.version);
  
  // Verificar se o worker está acessível
  fetch(workerPath)
    .then(() => console.log('[PDF.js] ✅ Worker local encontrado e acessível'))
    .catch(() => console.error('[PDF.js] ❌ Worker local não encontrado em:', workerPath));
}

/**
 * Gera um thumbnail de uma imagem redimensionando-a
 */
export const generateImageThumbnail = async (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 300
): Promise<File | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para blob e depois para File
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          
          const thumbnailFile = new File(
            [blob],
            `thumbnail_${file.name}`,
            { type: 'image/jpeg' }
          );
          
          resolve(thumbnailFile);
        }, 'image/jpeg', 0.85);
      };
      
      img.onerror = () => {
        resolve(null);
      };
      
      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      resolve(null);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Gera um thumbnail de um PDF convertendo a primeira página para imagem
 */
export const generatePdfThumbnail = async (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 300
): Promise<File | null> => {
  try {
    console.log('[PDF Thumbnail] Iniciando geração de thumbnail para:', file.name);
    console.log('[PDF Thumbnail] Tamanho do arquivo:', file.size, 'bytes');
    
    // FORÇAR configuração do worker antes de usar (evitar cache)
    const workerPath = '/pdf.worker.min.mjs';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
    
    // Verificar se foi configurado
    if (pdfjsLib.GlobalWorkerOptions.workerSrc !== workerPath) {
      console.error('[PDF Thumbnail] ❌ Falha ao configurar worker!', {
        esperado: workerPath,
        atual: pdfjsLib.GlobalWorkerOptions.workerSrc
      });
      return null;
    }
    
    console.log('[PDF Thumbnail] ✅ Worker configurado:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    // Ler o arquivo como ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('[PDF Thumbnail] Arquivo lido, tamanho do buffer:', arrayBuffer.byteLength);
    
    // Carregar o PDF
    console.log('[PDF Thumbnail] Carregando PDF...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('[PDF Thumbnail] PDF carregado, número de páginas:', pdf.numPages);
    
    // Obter a primeira página
    console.log('[PDF Thumbnail] Obtendo primeira página...');
    const page = await pdf.getPage(1);
    console.log('[PDF Thumbnail] Página obtida');
    
    // Calcular escala para o thumbnail
    const viewport = page.getViewport({ scale: 1.0 });
    console.log('[PDF Thumbnail] Viewport original:', { width: viewport.width, height: viewport.height });
    const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
    const scaledViewport = page.getViewport({ scale });
    console.log('[PDF Thumbnail] Viewport escalado:', { width: scaledViewport.width, height: scaledViewport.height, scale });
    
    // Criar canvas
    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    console.log('[PDF Thumbnail] Canvas criado:', { width: canvas.width, height: canvas.height });
    
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('[PDF Thumbnail] Não foi possível obter contexto do canvas');
      return null;
    }
    
    // Renderizar a página no canvas
    console.log('[PDF Thumbnail] Renderizando página no canvas...');
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport
    };
    
    await page.render(renderContext).promise;
    console.log('[PDF Thumbnail] Página renderizada com sucesso');
    
    // Converter canvas para blob e depois para File
    return new Promise((resolve) => {
      console.log('[PDF Thumbnail] Convertendo canvas para blob...');
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('[PDF Thumbnail] Erro ao converter canvas para blob');
          resolve(null);
          return;
        }
        
        console.log('[PDF Thumbnail] Blob criado, tamanho:', blob.size, 'bytes');
        const thumbnailFile = new File(
          [blob],
          `thumbnail_${file.name.replace('.pdf', '.jpg')}`,
          { type: 'image/jpeg' }
        );
        
        console.log('[PDF Thumbnail] Thumbnail gerado com sucesso:', thumbnailFile.name, thumbnailFile.size, 'bytes');
        resolve(thumbnailFile);
      }, 'image/jpeg', 0.85);
    });
  } catch (error) {
    console.error('[PDF Thumbnail] Erro ao gerar thumbnail do PDF:', error);
    if (error instanceof Error) {
      console.error('[PDF Thumbnail] Mensagem de erro:', error.message);
      console.error('[PDF Thumbnail] Stack:', error.stack);
    }
    return null;
  }
};

/**
 * Gera thumbnail baseado no tipo de arquivo
 */
export const generateThumbnail = async (
  file: File
): Promise<File | null> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;
  
  // Para imagens
  if (
    extension &&
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)
  ) {
    return await generateImageThumbnail(file);
  }
  
  // Para PDFs - gerar thumbnail da primeira página
  if (extension === 'pdf' || mimeType === 'application/pdf') {
    console.log('[Thumbnail] Gerando thumbnail para PDF:', file.name);
    return await generatePdfThumbnail(file);
  }
  
  // Para outros tipos, não gerar thumbnail
  return null;
};

