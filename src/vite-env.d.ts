
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
