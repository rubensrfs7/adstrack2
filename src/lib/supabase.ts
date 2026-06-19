
import { createClient } from '@supabase/supabase-js';

/**
 * CREDENCIAIS DO SISTEMA
 * Configurado para MODO DEMO (Dados Mockados).
 * Deixe as strings vazias para forçar o uso de dados estáticos em toda a aplicação.
 */
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.trim() !== '' && supabaseKey.trim() !== '');

// Fallback para evitar erros de inicialização do cliente
const placeholderUrl = 'https://placeholder.supabase.co';
// JWT fictício válido (header.payload.signature) para passar na validação do cliente
const placeholderKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const clientUrl = isSupabaseConfigured ? supabaseUrl : placeholderUrl;
const clientKey = isSupabaseConfigured ? supabaseKey : placeholderKey;

export const supabase = createClient(
  clientUrl, 
  clientKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
