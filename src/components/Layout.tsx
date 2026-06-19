
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, MapPin, Link as LinkIcon, MessageCircle, FileBarChart, User, LogOut, Menu, Moon, Sun, Link2, X, CheckCircle2, ShieldCheck, Kanban, Loader2, Facebook, Users, UserPlus, Settings2, Bell, Webhook, Instagram,
  HelpCircle, Building2, Globe, Megaphone, MessageSquareText, Handshake, FileText, GitFork, Sparkles, Settings, ChevronRight, ChevronLeft, Search, ChevronDown
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo, LogoIcon } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { SupportModal } from './SupportModal';
import { Breadcrumb } from './Breadcrumb';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Score Aumentou!', message: 'Campanha "Lançamento Verão" subiu para o estágio Performance (Score: 78)', time: '2 min atrás', type: 'success' },
    { id: 2, title: 'Novo Lead', message: 'Você recebeu um novo lead na campanha "E-book Grátis"', time: '15 min atrás', type: 'info' },
    { id: 3, title: 'Campanha no Topo', message: 'Campanha "Desafio 30 Dias" atingiu o Score 95!', time: '1 hora atrás', type: 'top' },
    { id: 4, title: 'Atenção Necessária', message: 'Campanha "Webinar" caiu para o estágio Atenção', time: '3 horas atrás', type: 'warning' },
  ]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leadtracker_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    name: 'Rubens Ferreira',
    email: 'rubens.rfs7@gmail.com',
    plan: 'Plano Premium',
    role: 'User',
    avatar: 'https://v4d.mz-css.net/f192fb8aa8790d64369e5db4e8d5b363/c80f08d7e4d3cf1cbceade0aed441b7c/Rubens_Ferreira.jpg'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('leadtracker_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('leadtracker_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const fetchProfile = async () => {
      const isDemo = localStorage.getItem('leadtracker_demo_mode') === 'true';
      if (isDemo) {
        const storedEmail = localStorage.getItem('leadtracker_user_email');
        const isAdmin = storedEmail === 'admin@adstrack.com.br';
        
        setCurrentUser({
          name: 'Rubens Ferreira',
          email: 'rubens.rfs7@gmail.com',
          plan: isAdmin ? 'Plano Enterprise' : 'Modo Visualização',
          role: isAdmin ? 'Admin' : 'User',
          avatar: 'https://v4d.mz-css.net/f192fb8aa8790d64369e5db4e8d5b363/c80f08d7e4d3cf1cbceade0aed441b7c/Rubens_Ferreira.jpg'
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
           setCurrentUser({
             name: data.full_name || 'Rubens Ferreira',
             email: session.user.email || 'rubens.rfs7@gmail.com',
             plan: 'Plano Premium',
             role: data.role || 'User',
             avatar: data.avatar_url || 'https://v4d.mz-css.net/f192fb8aa8790d64369e5db4e8d5b363/c80f08d7e4d3cf1cbceade0aed441b7c/Rubens_Ferreira.jpg'
           });
        }
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Leads', icon: UserPlus, path: '/leads' },
    { name: 'WhatsApp', icon: MessageCircle, path: '/whatsapp' },
    { name: 'Flow', icon: Kanban, path: '/crm' },
    { name: 'Relatórios', icon: FileText, path: '/reports' },
    { name: 'Mapa', icon: MapPin, path: '/location' },
    { name: 'AI', icon: Sparkles, path: '/links' },
    { name: 'Equipe', icon: Users, path: '/equipe' },
    { name: 'Configurações', icon: Settings, path: '/cadastro' },
  ];

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-[#050505]' : 'bg-gray-50'}`}>
      
      {/* Sidebar - Full Height */}
      <aside 
        className={`bg-gray-100 dark:bg-[#1a1d23] flex flex-col relative z-50 transition-all duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? (isSidebarExpanded ? 'w-60' : 'w-[60px]') : 'w-0 lg:w-0'}
          lg:static fixed inset-y-0 left-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className={`flex flex-col items-center py-4 border-b border-white/5 ${isSidebarExpanded ? 'px-3' : ''}`}>
          {isSidebarExpanded ? (
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#0096cc] transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className={`w-full ${isDarkMode ? 'bg-[#1a1d23] text-white placeholder-gray-500 border-white/10' : 'bg-white text-gray-900 placeholder-gray-400 border-gray-300'} border rounded-lg py-1.5 pl-9 pr-3 text-[11px] focus:outline-none focus:border-[#0096cc]/50 focus:ring-1 focus:ring-[#0096cc]/30 transition-all`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          ) : (
            <button 
              onClick={() => setIsSidebarExpanded(true)}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#3c414a] rounded-lg transition-all"
            >
              <Menu className="w-5 h-5 flex-shrink-0" />
            </button>
          )}
        </div>

        <nav className={`flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col ${isSidebarExpanded ? 'px-3 items-stretch' : 'items-center'}`}>
          {navItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center transition-all duration-200 group relative ${
                  isSidebarExpanded ? 'px-3 py-2 gap-3 h-10 rounded-lg' : 'justify-center w-10 h-10 rounded-lg'
                } ${
                  isActive
                    ? 'bg-gray-200 dark:bg-[#25282e] text-blue-600 border-l-4 border-blue-600 rounded-l-none'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#25282e] hover:text-gray-900 dark:hover:text-white'
                }`
              }
              title={isSidebarExpanded ? undefined : item.name}
            >
              <item.icon className={`${isSidebarExpanded ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0 transition-all duration-300`} />
              {isSidebarExpanded && (
                <span className="text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`py-4 border-t border-white/5 flex flex-col space-y-4 ${isSidebarExpanded ? 'px-3' : 'items-center'}`}>
          <button 
            className={`text-gray-400 hover:text-white transition-colors flex items-center ${isSidebarExpanded ? 'px-3 gap-3' : 'justify-center'}`} 
            title="Ajuda"
            onClick={() => setIsSupportModalOpen(true)}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {isSidebarExpanded && <span className="text-xs font-semibold">Ajuda</span>}
          </button>
        </div>

        {/* Sidebar Toggle Button (Floating between sidebar and content) */}
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-[50px] w-6 h-6 bg-gray-100 dark:bg-[#1a1d23] rounded-full flex items-center justify-center text-gray-400 border border-black/10 dark:border-white/10 shadow-xl z-50 hover:text-black dark:hover:text-white transition-all group"
        >
          <div className="w-full h-full rounded-full border-2 border-gray-200 dark:border-[#1a1d23] flex items-center justify-center bg-gray-100 dark:bg-[#1a1d23] group-hover:bg-gray-200 dark:group-hover:bg-[#25282e]">
            {isSidebarExpanded ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </div>
        </button>
      </aside>

      {/* Right Column: Top Bar + Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header Row */}
        <header className={`${isDarkMode ? 'bg-[#0f1114]' : 'bg-gray-200'} h-14 flex-shrink-0 flex items-center justify-between pl-4 lg:pl-8 pr-4 lg:pr-8 z-40 shadow-sm transition-colors duration-300`}>
          <div className="flex items-center gap-6 h-full">
            <div className="flex items-center gap-2 h-full">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-32 h-9 rounded-lg bg-transparent flex items-center justify-center overflow-hidden">
                  <img src={isDarkMode ? 'https://app.adstrack.com.br/assets/ads-logo-branco-HJ3-AwHk.png' : 'https://app.adstrack.com.br/assets/ads-logo-preto-ihher5Lm.png'} alt="ADS" className="w-full h-full object-contain" />
                </div>
                <div className="h-8 w-px bg-gray-400 dark:bg-white/20 mx-2" />
                <span className="text-[11px] text-gray-700 dark:text-white/70 uppercase tracking-widest hidden sm:block">SISTEMA AVANÇADO DE TRACKEAMENTO</span>
              </div>
            </div>
            
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-200 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-full p-0.5 w-14 h-7 cursor-pointer relative shadow-inner" onClick={() => setIsDarkMode(!isDarkMode)}>
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white border border-gray-300 dark:border-gray-700 flex items-center justify-center shadow-md transition-all duration-300 ${isDarkMode ? 'left-[31px]' : 'left-0.5'}`}>
                {isDarkMode ? <Moon className="w-4 h-4 text-[#0096cc]" /> : <Sun className="w-4 h-4 text-[#0096cc]" />}
              </div>
            </div>

            <div className="relative">
              <select 
                className="appearance-none bg-transparent text-gray-700 dark:text-white/80 text-[11px] font-semibold focus:outline-none hover:text-gray-900 dark:hover:text-white cursor-pointer pr-5"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="pt">PT</option>
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
              <div className="absolute right-0 top-0 pointer-events-none flex items-center justify-center h-full text-gray-400">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0096cc]" />
                )}
              </button>
            </div>

            {isNotificationsOpen && (
              <div className="absolute top-16 right-4 w-96 bg-white dark:bg-[#1a1d23] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-900 dark:text-white font-bold">Notificações</h3>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                      <p className="text-gray-900 dark:text-white text-sm font-semibold">{n.title}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">{n.message}</p>
                      <p className="text-gray-500 text-[10px] mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="relative group">
              <div 
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{currentUser.name.split(' ')[0]} {currentUser.role === 'Admin' ? 'Admin' : 'Supervisor'}</span>
                  <span className="text-[10px] text-gray-700 dark:text-white/70 leading-tight">Supervisor de Chatbot</span>
                </div>
              </div>
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1a1d23] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                <div 
                  className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => navigate('/profile')}
                >
                  <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white/50 truncate">Supervisor de Chatbot</p>
                  </div>
                  <div className="px-2 py-0.5 bg-[#0096cc] rounded text-[10px] font-bold text-white">ATUAL</div>
                  <CheckCircle2 className="w-4 h-4 text-[#0096cc]" />
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative text-gray-800 dark:text-zinc-100 bg-gray-50 dark:bg-black transition-colors duration-700 p-4 lg:p-8">
            <Breadcrumb />
            {children}
        </main>
        <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
      </div>
    </div>
  );
};

export default Layout;
