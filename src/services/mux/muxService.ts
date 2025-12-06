import { supabase } from '@/integrations/supabase/client';

export interface MuxUploadResponse {
  upload_id: string;
  url: string;
  video_id: string;
  status: string;
}

export interface MuxUploadProgress {
  uploaded: number;
  total: number;
  percentage: number;
}

/**
 * Serviço para gerenciar uploads e operações com Mux
 * Usa supabase.functions.invoke para chamar Edge Functions
 */
export class MuxService {

  /**
   * Cria um Direct Upload URL no Mux via Edge Function
   * Usa supabase.functions.invoke que gerencia JWT e URL automaticamente
   * Agora cria um vídeo na tabela videos primeiro e retorna video_id
   */
  async createUploadUrl(companyId: string): Promise<MuxUploadResponse> {
    try {
      if (!companyId) {
        throw new Error('company_id é obrigatório');
      }

      console.log('[MuxService] Chamando Edge Function mux-create-upload via invoke...', { companyId });

      // Usar supabase.functions.invoke que já gerencia JWT e URL corretamente
      const { data, error } = await supabase.functions.invoke('mux-create-upload', {
        body: {
          company_id: companyId,
        },
      });

      console.log('[MuxService] Resposta do invoke:', { 
        hasData: !!data, 
        hasError: !!error,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        dataValue: data ? JSON.stringify(data).substring(0, 500) : null,
        errorMessage: error?.message,
        errorType: error ? typeof error : null
      });

      // Verificar se há erro no campo error OU no campo data.error
      if (error) {
        const errorStatus = (error as any).status;
        const errorContext = (error as any).context;
        const responseData = errorContext?.data || errorContext || data;

        // Log detalhado do erro
        console.error('[MuxService] Erro no invoke mux-create-upload:', {
          error,
          status: errorStatus,
          data,
          responseData,
          errorMessage: error.message,
          context: errorContext
        });

        // Se data tem erro, usar esse erro (prioridade)
        if (data && data.error) {
          const dataError = data.error;
          const dataMessage = data.message || dataError;
          const dataDetails = data.details;
          
          console.error('[MuxService] Erro retornado no data:', { 
            error: dataError, 
            message: dataMessage, 
            details: dataDetails 
          });
          
          // Mensagens específicas por tipo de erro
          if (dataError === 'missing_company_id') {
            throw new Error(
              `Erro ${errorStatus || 400}: ${dataMessage}\n\n` +
              'O company_id não foi enviado. Verifique se uma empresa está selecionada.'
            );
          }

          if (dataError === 'missing_supabase_env' || dataError === 'missing_mux_env') {
            throw new Error(
              `Erro ${errorStatus || 500}: ${dataMessage}\n\n` +
              'Configure os secrets da função no Supabase Dashboard:\n' +
              '- SUPABASE_URL\n' +
              '- SUPABASE_SERVICE_ROLE_KEY\n' +
              '- MUX_TOKEN_ID\n' +
              '- MUX_TOKEN_SECRET\n\n' +
              'Acesse: Settings → Edge Functions → mux-create-upload → Secrets'
            );
          }

          if (dataError === 'video_insert_failed') {
            throw new Error(
              `Erro ${errorStatus || 500}: ${dataMessage}\n\n` +
              `Detalhes: ${dataDetails || 'Erro ao criar vídeo na tabela videos'}\n\n` +
              'Verifique:\n' +
              '1. Se a tabela videos existe\n' +
              '2. Se o company_id é válido\n' +
              '3. Os logs da função no Supabase Dashboard'
            );
          }

          if (dataError === 'mux_error') {
            throw new Error(
              `Erro ${errorStatus || 500}: ${dataMessage}\n\n` +
              'Erro ao se comunicar com o Mux. Verifique as credenciais MUX_TOKEN_ID e MUX_TOKEN_SECRET.'
            );
          }

          // Erro genérico da função
          throw new Error(
            `Erro ${errorStatus || 'erro'} ao chamar mux-create-upload: ${dataMessage}` +
            (dataDetails ? `\n\nDetalhes: ${dataDetails}` : '')
          );
        }

        // Se responseData tem erro (do contexto)
        if (responseData?.error || responseData?.message) {
          const errorMessage = responseData.message || responseData.error;
          const errorDetails = responseData.details;
          
          throw new Error(
            `Erro ${errorStatus || 'erro'} ao chamar mux-create-upload: ${errorMessage}` +
            (errorDetails ? `\n\nDetalhes: ${errorDetails}` : '')
          );
        }

        // Se for 404, função não encontrada
        if (errorStatus === 404 || error.message?.includes('404')) {
          throw new Error(
            'Função não encontrada (404). Verifique:\n' +
            '1. Se o projeto Supabase está correto (gswvicwtswokyfbgoxps)\n' +
            '2. Se a função mux-create-upload foi deployada\n' +
            '3. Se você está autenticado'
          );
        }

        // Se for 401, problema de autenticação
        if (errorStatus === 401 || error.message?.includes('401')) {
          throw new Error('Não autorizado. Faça login novamente.');
        }

        // Erro genérico com status
        const baseMsg = data?.message || error.message || 'Erro ao criar upload no Mux';
        throw new Error(
          errorStatus
            ? `Erro ${errorStatus} ao chamar mux-create-upload: ${baseMsg}`
            : baseMsg
        );
      }

      if (!data) {
        console.error('[MuxService] Resposta vazia da Edge Function');
        throw new Error('Resposta vazia da Edge Function');
      }

      console.log('[MuxService] Resposta recebida da Edge Function:', {
        hasUploadId: !!data.upload_id,
        hasUrl: !!data.url,
        hasVideoId: !!data.video_id,
        hasStatus: !!data.status,
        hasError: !!data.error,
        fullData: data
      });

      // Se data contém um erro, lançar exceção
      if (data.error) {
        // Se for erro do Mux (estrutura padronizada)
        if (data.error === 'mux_error') {
          const muxStatus = data.status;
          const muxMessage = data.message || 'Erro ao se comunicar com o Mux';
          
          if (muxStatus === 401 || muxStatus === 403) {
            throw new Error(
              `${muxMessage}\n\n` +
              'Configure as variáveis de ambiente no Supabase Dashboard:\n' +
              '- MUX_TOKEN_ID\n' +
              '- MUX_TOKEN_SECRET\n\n' +
              'Acesse: Settings → Edge Functions → mux-create-upload → Secrets\n\n' +
              'Verifique também se o token tem permissão de escrita (upload) no Mux.'
            );
          } else if (muxStatus === 404) {
            throw new Error(
              `${muxMessage}\n\n` +
              'Verifique se:\n' +
              '1. As credenciais MUX_TOKEN_ID e MUX_TOKEN_SECRET estão corretas\n' +
              '2. O serviço Mux está disponível\n' +
              '3. O token tem as permissões necessárias'
            );
          }
          
          throw new Error(`${muxMessage} (Status: ${muxStatus})`);
        }

        // Outros tipos de erro
        const errorMessage = data.error || data.message || 'Erro ao criar upload no Mux';
        throw new Error(errorMessage);
      }

      // Validar estrutura da resposta
      const missingFields: string[] = [];
      if (!data.upload_id) missingFields.push('upload_id');
      if (!data.url) missingFields.push('url');
      if (!data.video_id) missingFields.push('video_id');
      
      if (missingFields.length > 0) {
        console.error('[MuxService] Resposta inválida - campos faltando:', {
          missingFields,
          upload_id: data.upload_id,
          url: data.url,
          video_id: data.video_id,
          status: data.status,
          fullData: JSON.stringify(data, null, 2)
        });
        throw new Error(
          `Resposta inválida da Edge Function. Campos faltando: ${missingFields.join(', ')}. ` +
          `Estrutura esperada: { upload_id, url, video_id, status }. ` +
          `Recebido: ${JSON.stringify(data).substring(0, 200)}`
        );
      }

      return data as MuxUploadResponse;
    } catch (error: any) {
      console.error('[MuxService] Erro ao criar upload URL:', error);
      throw error;
    }
  }

  /**
   * Faz upload de um arquivo diretamente para o Mux
   * Usa a biblioteca @mux/upchunk para uploads confiáveis
   */
  async uploadVideo(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: MuxUploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Importar upchunk dinamicamente
      import('@mux/upchunk').then(({ createUpload }) => {
        const upload = createUpload({
          endpoint: uploadUrl,
          file: file,
          chunkSize: 5120, // 5MB chunks
        });

        upload.on('error', (error: any) => {
          console.error('[MuxService] Erro no upload:', error);
          reject(new Error(error.detail || 'Erro ao fazer upload do vídeo'));
        });

        upload.on('progress', (progress: any) => {
          if (onProgress) {
            onProgress({
              uploaded: progress.detail.bytesUploaded || 0,
              total: progress.detail.totalBytes || file.size,
              percentage: progress.detail.percentComplete || 0,
            });
          }
        });

        upload.on('success', () => {
          resolve();
        });
      }).catch((error) => {
        console.error('[MuxService] Erro ao importar upchunk:', error);
        // Fallback: tentar upload manual com fetch
        this.uploadVideoFallback(file, uploadUrl, onProgress)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Fallback para upload manual caso upchunk não esteja disponível
   */
  private async uploadVideoFallback(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: MuxUploadProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            uploaded: e.loaded,
            total: e.total,
            percentage: (e.loaded / e.total) * 100,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload falhou com status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Erro de rede durante o upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelado'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  /**
   * Verifica o status de um vídeo na tabela videos
   */
  async checkVideoStatus(videoId: string): Promise<{
    status: string;
    playback_id?: string;
    duration?: number;
    thumbnail_url?: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('mux_status, mux_playback_id, mux_duration, mux_thumbnail_url')
        .eq('id', videoId)
        .single();

      if (error) {
        throw error;
      }

      return data ? {
        status: data.mux_status || 'unknown',
        playback_id: data.mux_playback_id || undefined,
        duration: data.mux_duration || undefined,
        thumbnail_url: data.mux_thumbnail_url || undefined,
      } : null;
    } catch (error) {
      console.error('[MuxService] Erro ao verificar status do vídeo:', error);
      return null;
    }
  }
}

// Instância singleton
export const muxService = new MuxService();
