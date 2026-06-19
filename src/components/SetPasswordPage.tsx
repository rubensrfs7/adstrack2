
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

const SetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock supervisor name based on token for demo
  const supervisorName = "Júlio Geovani";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acesso Definido!</h2>
          <p className="text-gray-500">Seu usuário e senha foram cadastrados com sucesso. Agora você já pode acessar a plataforma.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo className="h-10 text-gray-900" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md border border-gray-100">
        <div className="p-8 bg-blue-50/50 border-b border-blue-100/50 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ativar Supervisor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Bem vindo <span className="font-bold text-gray-700">{supervisorName}</span>, defina sua senha para começar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Definir Usuário (Login)</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu usuário de acesso"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Definir Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirmar Senha</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita sua senha"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Definir Acesso
          </button>

          <div className="text-center pt-2">
            <Link to="/" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetPasswordPage;
