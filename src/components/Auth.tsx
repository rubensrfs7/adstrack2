
import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Logo } from './Logo';

interface AuthProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onSwitchMode, onBack }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateError = (err: any): string => {
    const rawMessage = err?.message || err?.error_description || (typeof err === 'string' ? err : JSON.stringify(err));
    
    if (rawMessage.includes('Invalid login credentials')) {
      return 'E-mail ou senha incorretos. Verifique seus dados ou tente o Modo Convidado.';
    }
    if (rawMessage.includes('User already registered')) {
      return 'Este e-mail já está cadastrado no sistema.';
    }
    if (rawMessage.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (rawMessage.includes('Email not confirmed')) {
      return 'Por favor, confirme seu e-mail antes de fazer login.';
    }
    
    return rawMessage;
  };

  const handleGuestLogin = () => {
    localStorage.setItem('leadtracker_demo_mode', 'true');
    localStorage.removeItem('leadtracker_user_email'); // Clear specific user
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // BYPASS LOGIN FOR SPECIFIC ADMIN EMAIL (DEMO PURPOSE)
    if (cleanEmail === 'admin@adstrack.com.br') {
        setTimeout(() => {
            localStorage.setItem('leadtracker_demo_mode', 'true');
            localStorage.setItem('leadtracker_user_email', cleanEmail);
            window.location.reload();
        }, 1500);
        return;
    }

    // MODO MOCKADO / DEMO GENÉRICO
    if (!isSupabaseConfigured) {
        setTimeout(() => {
            localStorage.setItem('leadtracker_demo_mode', 'true');
            window.location.reload();
        }, 1000);
        return;
    }

    try {
      if (mode === 'register') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;
        
        if (data.user) {
            await supabase.from('profiles').upsert({ 
                id: data.user.id,
                email: cleanEmail,
                full_name: fullName,
                role: 'user',
                is_active: true
            });

            if (data.session) {
              onSuccess();
              navigate('/dashboard');
              return;
            }
        }

        alert('Cadastro realizado! Agora você pode fazer login.');
        onSwitchMode('login');
      } else {
        if (!cleanPassword) {
            throw new Error('A senha é obrigatória.');
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signInError) throw signInError;
        onSuccess();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const isAdminEmail = email.trim().toLowerCase() === 'admin@adstrack.com.br';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col justify-center items-center p-4 font-sans">
      <button 
        onClick={onBack} 
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl w-full max-w-md p-8 sm:p-12 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <Logo className="h-12 text-gray-900 dark:text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {mode === 'login' ? 'Bem-vindo' : 'Criar Conta'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {!isSupabaseConfigured 
              ? 'Modo Demonstração (Dados Locais)' 
              : (mode === 'login' ? 'Acesse seu dashboard de tracking' : 'Comece a rastrear seus leads hoje')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 p-5 rounded-2xl mb-8 text-sm flex gap-4 animate-in slide-in-from-top-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-black uppercase text-[10px] tracking-widest mb-1">Acesso Negado</p>
              <p className="font-bold leading-relaxed">{error}</p>
              {mode === 'login' && (
                <button onClick={handleGuestLogin} className="mt-2 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">
                  Tentar Modo Convidado →
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Nome Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="Seu nome" 
                required 
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="seu@email.com" 
              required 
            />
          </div>

          <div className={`space-y-2 transition-all duration-300 ${isAdminEmail ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Senha</label>
                {isAdminEmail && <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><KeyRound className="w-3 h-3" /> Acesso VIP Liberado</span>}
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:cursor-not-allowed" 
              placeholder={isAdminEmail ? "Não requer senha" : "••••••••"}
              required={!isAdminEmail}
              disabled={isAdminEmail}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 ${
                isAdminEmail ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                isAdminEmail ? 'Entrar como Admin' : (mode === 'login' ? 'Acessar Painel' : 'Criar Minha Conta')
            )}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já possui cadastro?'}
            <button 
              onClick={() => {
                  setError(null);
                  onSwitchMode(mode === 'login' ? 'register' : 'login');
              }}
              className="ml-2 text-blue-600 dark:text-blue-400 font-black hover:underline"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Fazer Login'}
            </button>
          </p>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={handleGuestLogin}
              className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
            >
              Entrar como Convidado (Modo Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
