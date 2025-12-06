import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { exchangeCodeForTokens, saveSpotifyTokens, getSpotifyUser } from '@/services/spotify/spotifyAuth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Página de callback do Spotify OAuth
 * Recebe o código de autorização e troca por tokens
 */
export const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando conexão com Spotify...');

  useEffect(() => {
    const processCallback = async () => {
      // Verificar se usuário está autenticado
      if (!authUser?.id) {
        setStatus('error');
        setMessage('Você precisa estar logado para conectar o Spotify');
        toast.error('Faça login para conectar o Spotify');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Verificar se houve erro na autorização
        if (error) {
          setStatus('error');
          setMessage('Autorização cancelada ou negada');
          toast.error('Não foi possível conectar ao Spotify');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Verificar se temos código
        if (!code) {
          setStatus('error');
          setMessage('Código de autorização não encontrado');
          toast.error('Erro ao processar autorização do Spotify');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Trocar código por tokens
        setMessage('Obtendo permissões...');
        const tokens = await exchangeCodeForTokens(code);

        // Buscar informações do usuário
        setMessage('Carregando suas informações...');
        const user = await getSpotifyUser(tokens.access_token);
        
        // Salvar tokens no banco associados ao usuário
        await saveSpotifyTokens(authUser.id, tokens, user);
        
        setStatus('success');
        setMessage(`Conectado como ${user.display_name || user.id}`);
        toast.success('Spotify conectado com sucesso!');

        // Redirecionar após 1 segundo
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (error: any) {
        console.error('Erro ao processar callback do Spotify:', error);
        setStatus('error');
        setMessage(error.message || 'Erro ao conectar com Spotify');
        toast.error(error.message || 'Erro ao conectar com Spotify');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, authUser?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-foreground font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecionando...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-red-500 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-foreground font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
};

