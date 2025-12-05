import { useState, useEffect, useCallback } from 'react';
import {
  redirectToSpotifyAuth,
  exchangeCodeForTokens,
  refreshAccessToken,
  getSpotifyUser,
  saveSpotifyTokens,
  getSpotifyTokens,
  clearSpotifyTokens,
  getSpotifyConnection,
  isTokenExpired,
  type SpotifyTokens,
  type SpotifyUser,
} from '@/services/spotify/spotifyAuth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseSpotifyAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  user: SpotifyUser | null;
  accessToken: string | null;
  connect: () => void;
  disconnect: () => void;
  getValidAccessToken: () => Promise<string | null>;
}

/**
 * Hook para gerenciar autenticação do Spotify
 */
export const useSpotifyAuth = (): UseSpotifyAuthReturn => {
  const { user: authUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);

  // Carregar tokens salvos ao montar ou quando usuário mudar
  useEffect(() => {
    const loadTokens = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        setIsConnected(false);
        setUser(null);
        setTokens(null);
        return;
      }

      try {
        // Primeiro, verificar se há conexão salva
        const connection = await getSpotifyConnection(authUser.id);
        
        if (!connection) {
          setIsLoading(false);
          setIsConnected(false);
          return;
        }

        // Buscar tokens do banco
        const savedTokens = await getSpotifyTokens(authUser.id);
        
        if (!savedTokens) {
          setIsLoading(false);
          setIsConnected(false);
          return;
        }

        // Verificar se token está expirado
        if (isTokenExpired(savedTokens)) {
          // Tentar atualizar token
          try {
            const refreshed = await refreshAccessToken(savedTokens.refresh_token);
            await saveSpotifyTokens(authUser.id, refreshed, user || undefined);
            setTokens(refreshed);
            
            // Buscar informações do usuário
            const userData = await getSpotifyUser(refreshed.access_token);
            setUser(userData);
            setIsConnected(true);
          } catch (error) {
            console.error('Erro ao atualizar token:', error);
            await clearSpotifyTokens(authUser.id);
            setIsConnected(false);
            setUser(null);
            setTokens(null);
          }
        } else {
          setTokens(savedTokens);
          
          // Usar informações salvas ou buscar do Spotify
          if (connection.spotify_display_name) {
            setUser({
              id: connection.spotify_user_id || '',
              display_name: connection.spotify_display_name,
            });
          } else {
            // Buscar informações do usuário
            try {
              const userData = await getSpotifyUser(savedTokens.access_token);
              setUser(userData);
            } catch (error) {
              console.error('Erro ao buscar usuário:', error);
            }
          }
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Erro ao carregar tokens:', error);
        setIsConnected(false);
        setUser(null);
        setTokens(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, [authUser?.id]);

  /**
   * Redireciona para página de autorização do Spotify
   */
  const connect = useCallback(async () => {
    try {
      await redirectToSpotifyAuth();
    } catch (error: any) {
      console.error('Erro ao conectar Spotify:', error);
      toast.error(error.message || 'Erro ao conectar com Spotify. Verifique se o Client ID está configurado.');
    }
  }, []);

  /**
   * Desconecta do Spotify
   */
  const disconnect = useCallback(async () => {
    if (!authUser?.id) return;
    
    try {
      await clearSpotifyTokens(authUser.id);
      setTokens(null);
      setUser(null);
      setIsConnected(false);
      toast.success('Desconectado do Spotify');
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar do Spotify');
    }
  }, [authUser?.id]);

  /**
   * Obtém access token válido (atualiza se necessário)
   */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    if (!tokens || !authUser?.id) return null;

    // Se token está expirado, atualizar
    if (isTokenExpired(tokens)) {
      try {
        const refreshed = await refreshAccessToken(tokens.refresh_token);
        await saveSpotifyTokens(authUser.id, refreshed, user || undefined);
        setTokens(refreshed);
        return refreshed.access_token;
      } catch (error) {
        console.error('Erro ao atualizar token:', error);
        await disconnect();
        return null;
      }
    }

    return tokens.access_token;
  }, [tokens, authUser?.id, user, disconnect]);


  return {
    isConnected,
    isLoading,
    user,
    accessToken: tokens?.access_token || null,
    connect,
    disconnect,
    getValidAccessToken,
  };
};
