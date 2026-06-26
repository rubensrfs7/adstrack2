
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LocationPage from './components/LocationPage';
import LinksPage from './components/LinksPage';
import WhatsappPage from './components/WhatsappPage';
import WebhookPage from './components/WebhookPage';
import ReportsPage from './components/ReportsPage';
import ProfilePage from './components/ProfilePage';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import AdminPage from './components/AdminPage';
import FlowPage from './components/FlowPage';
import LeadsPage from './components/LeadsPage'; // Leads
import InstagramPage from './components/InstagramPage';
import CadastroPage from './components/CadastroPage';
import SetPasswordPage from './components/SetPasswordPage';
import RedirectPage from './components/RedirectPage';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const isDemoForced = localStorage.getItem('leadtracker_demo_mode') === 'true';

    if (!isSupabaseConfigured || isDemoForced) {
      const storedEmail = localStorage.getItem('leadtracker_user_email');
      const isAdmin = storedEmail === 'admin@adstrack.com.br';
      
      setSession({
        user: { 
          id: 'demo-user', 
          email: storedEmail || 'demo@adstrack.com.br',
          user_metadata: { full_name: isAdmin ? 'Administrador' : 'Usuário Demo' }
        }
      });
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Se não houver sessão e o modo demo estiver ativo, não limpa
      const demoActive = localStorage.getItem('leadtracker_demo_mode') === 'true';
      if (!session && demoActive) return;
      
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('leadtracker_demo_mode');
    localStorage.removeItem('leadtracker_user_email');
    
    if (!isSupabaseConfigured) {
      setSession(null);
      setAuthMode(null);
      return;
    }
    try {
      await supabase.auth.signOut();
      setSession(null);
      setAuthMode(null);
    } catch (err) {
      setSession(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black text-blue-600 gap-4">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium font-sans">Sincronizando AdsTrack...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          {/* Rota de Redirecionamento (Pública) */}
          <Route path="/r/:shortCode" element={<RedirectPage />} />

        {/* Rotas Protegidas ou Landing */}
        <Route 
          path="/*" 
          element={
            !session ? (
              authMode ? (
                <Auth 
                  mode={authMode} 
                  onSuccess={() => setAuthMode(null)} 
                  onSwitchMode={setAuthMode}
                  onBack={() => setAuthMode(null)}
                />
              ) : (
                <LandingPage 
                  onLoginClick={() => setAuthMode('login')} 
                  onRegisterClick={() => setAuthMode('register')} 
                />
              )
            ) : (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leads" element={<LeadsPage />} />
                  <Route path="/crm" element={<FlowPage />} />
                  <Route path="/location" element={<LocationPage />} />
                  <Route path="/links" element={<LinksPage />} />
                  <Route path="/whatsapp" element={<WhatsappPage />} />
                   <Route path="/webhook" element={<WebhookPage />} />
                  <Route path="/instagram" element={<InstagramPage />} />
                  <Route path="/cadastro" element={<CadastroPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/set-password/:token" element={<SetPasswordPage />} />
                </Routes>
              </Layout>
            )
          } 
        />
      </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
