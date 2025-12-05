/**
 * Serviço de autenticação Spotify usando OAuth 2.0 com PKCE
 * 
 * Fluxo:
 * 1. Gera code_verifier e code_challenge (PKCE)
 * 2. Redireciona usuário para página de autorização do Spotify
 * 3. Spotify redireciona de volta com código
 * 4. Troca código por access_token e refresh_token usando code_verifier
 * 5. Armazena tokens de forma segura
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/spotify/callback`;
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Log da Redirect URI para debug
if (typeof window !== 'undefined') {
  console.log('🔗 Spotify Redirect URI:', SPOTIFY_REDIRECT_URI);
  console.log('📋 Configure esta URL exatamente no Spotify Dashboard:', SPOTIFY_REDIRECT_URI);
}

// Validação inicial do Client ID
if (typeof window !== 'undefined' && !SPOTIFY_CLIENT_ID) {
  console.warn(
    '⚠️ VITE_SPOTIFY_CLIENT_ID não configurado. ' +
    'Adicione a variável no arquivo .env para habilitar a integração com Spotify.'
  );
}

/**
 * Gera um code_verifier aleatório para PKCE
 * Deve ser uma string URL-safe de 43-128 caracteres
 */
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Converter para base64url (sem padding)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Gera code_challenge a partir do code_verifier usando SHA256
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Scopes necessários para controlar playback e ler playlists
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  images?: Array<{ url: string }>;
}

/**
 * Gera URL de autorização do Spotify com PKCE
 */
export const getSpotifyAuthUrl = async (): Promise<{ url: string; verifier: string }> => {
  if (!SPOTIFY_CLIENT_ID) {
    console.error('SPOTIFY_CLIENT_ID não encontrado:', {
      env: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      defined: typeof SPOTIFY_CLIENT_ID !== 'undefined',
      value: SPOTIFY_CLIENT_ID,
    });
    throw new Error(
      'Spotify Client ID não configurado. Por favor, adicione VITE_SPOTIFY_CLIENT_ID no arquivo .env e reinicie o servidor.'
    );
  }
  
  console.log('Gerando URL de autorização Spotify:', {
    client_id: `${SPOTIFY_CLIENT_ID.substring(0, 8)}...`,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Salvar verifier temporariamente para usar no callback
  sessionStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true', // Sempre mostrar diálogo para garantir permissões
  });

  return {
    url: `${SPOTIFY_AUTH_URL}?${params.toString()}`,
    verifier: codeVerifier,
  };
};

/**
 * Redireciona usuário para página de autorização do Spotify
 */
export const redirectToSpotifyAuth = async (): Promise<void> => {
  const { url } = await getSpotifyAuthUrl();
  window.location.href = url;
};

/**
 * Troca código de autorização por tokens usando PKCE
 */
export const exchangeCodeForTokens = async (code: string): Promise<SpotifyTokens> => {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error(
      'Spotify Client ID não configurado. Por favor, adicione VITE_SPOTIFY_CLIENT_ID no arquivo .env e reinicie o servidor.'
    );
  }

  // Recuperar code_verifier do sessionStorage
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier não encontrado. Por favor, tente conectar novamente.');
  }

  // Remover verifier após uso
  sessionStorage.removeItem('spotify_code_verifier');

  // Usar PKCE - não precisa de client_secret
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error', error_description: 'Erro desconhecido' }));
    console.error('Erro ao obter tokens do Spotify:', {
      status: response.status,
      statusText: response.statusText,
      error,
      client_id: SPOTIFY_CLIENT_ID ? `${SPOTIFY_CLIENT_ID.substring(0, 8)}...` : 'não configurado',
      redirect_uri: SPOTIFY_REDIRECT_URI,
    });
    
    if (error.error === 'invalid_client') {
      throw new Error(
        'Client ID inválido. Verifique se:\n' +
        '1. O Client ID está correto no arquivo .env\n' +
        '2. O servidor foi reiniciado após adicionar a variável\n' +
        '3. A app existe no Spotify Developer Dashboard\n' +
        '4. A Redirect URI está configurada corretamente no Spotify'
      );
    }
    
    throw new Error(error.error_description || error.error || 'Erro ao obter tokens do Spotify');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    expires_at: Date.now() + data.expires_in * 1000,
  };
};

/**
 * Atualiza access token usando refresh token
 * Para refresh token, não precisamos de PKCE, mas ainda não precisamos de client_secret
 */
export const refreshAccessToken = async (refreshToken: string): Promise<SpotifyTokens> => {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error(
      'Spotify Client ID não configurado. Por favor, adicione VITE_SPOTIFY_CLIENT_ID no arquivo .env'
    );
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Erro ao atualizar token do Spotify');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Spotify pode não retornar novo refresh_token
    expires_in: data.expires_in,
    expires_at: Date.now() + data.expires_in * 1000,
  };
};

/**
 * Obtém informações do usuário do Spotify
 */
export const getSpotifyUser = async (accessToken: string): Promise<SpotifyUser> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao obter informações do usuário do Spotify');
  }

  return response.json();
};

/**
 * Armazena tokens no banco de dados associados ao usuário
 */
export const saveSpotifyTokens = async (
  userId: string,
  tokens: SpotifyTokens,
  spotifyUser?: SpotifyUser
): Promise<void> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { error } = await supabase
    .from('spotify_connections')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expires_at).toISOString(),
      spotify_user_id: spotifyUser?.id,
      spotify_display_name: spotifyUser?.display_name,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Erro ao salvar tokens do Spotify:', error);
    throw new Error('Erro ao salvar conexão do Spotify');
  }
};

/**
 * Recupera tokens do banco de dados para o usuário atual
 */
export const getSpotifyTokens = async (userId: string): Promise<SpotifyTokens | null> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase
    .from('spotify_connections')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar tokens do Spotify:', error);
    return null;
  }

  if (!data) return null;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000),
    expires_at: new Date(data.expires_at).getTime(),
  };
};

/**
 * Remove tokens do banco de dados
 */
export const clearSpotifyTokens = async (userId: string): Promise<void> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { error } = await supabase
    .from('spotify_connections')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Erro ao remover tokens do Spotify:', error);
    throw new Error('Erro ao desconectar do Spotify');
  }
};

/**
 * Obtém informações da conexão do Spotify do usuário
 */
export const getSpotifyConnection = async (userId: string): Promise<{
  spotify_user_id: string | null;
  spotify_display_name: string | null;
} | null> => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase
    .from('spotify_connections')
    .select('spotify_user_id, spotify_display_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar conexão do Spotify:', error);
    return null;
  }

  return data;
};

/**
 * Verifica se o token está expirado
 */
export const isTokenExpired = (tokens: SpotifyTokens): boolean => {
  // Considerar expirado se faltar menos de 5 minutos
  return Date.now() >= tokens.expires_at - 5 * 60 * 1000;
};
