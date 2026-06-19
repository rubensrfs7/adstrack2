
import React, { useState, useEffect } from 'react';
import { 
  Instagram, Plus, Search, TrendingUp, Users, MessageCircle, BarChart3, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Link2, Trash2, 
  ExternalLink, Loader2, Globe, Heart, ShieldCheck
} from 'lucide-react';
import { InstagramAccount, InstagramInsightData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

// Mock Data
const MOCK_INSTAGRAM_ACCOUNTS: InstagramAccount[] = [
  {
    id: '1',
    username: 'adstrack.official',
    name: 'AdsTrack Official',
    profile_picture_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200&h=200&auto=format&fit=crop',
    followers_count: 12500,
    follows_count: 250,
    media_count: 156,
    is_own: true,
    engagement_rate: 4.8,
    biography: 'Sua plataforma de trackeamento inteligente de anúncios.',
    history: [
      { date: '11/06', followers: 12100, engagement: 4.2, reach: 5000, impressions: 8000 },
      { date: '12/06', followers: 12150, engagement: 4.3, reach: 5200, impressions: 8200 },
      { date: '13/06', followers: 12200, engagement: 4.5, reach: 5500, impressions: 8500 },
      { date: '14/06', followers: 12300, engagement: 4.6, reach: 6000, impressions: 9000 },
      { date: '15/06', followers: 12400, engagement: 4.7, reach: 6500, impressions: 9500 },
      { date: '16/06', followers: 12450, engagement: 4.8, reach: 6700, impressions: 9800 },
      { date: 'Today', followers: 12500, engagement: 4.8, reach: 7000, impressions: 10200 },
    ]
  },
  {
    id: '2',
    username: 'competitor.alpha',
    name: 'Alpha Digital',
    profile_picture_url: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?q=80&w=200&h=200&auto=format&fit=crop',
    followers_count: 45000,
    follows_count: 800,
    media_count: 450,
    is_own: false,
    engagement_rate: 2.1,
    biography: 'Soluções em marketing digital para empresas.',
    history: [
      { date: '11/06', followers: 44800, engagement: 2.0, reach: 12000, impressions: 20000 },
      { date: 'Today', followers: 45000, engagement: 2.1, reach: 13000, impressions: 22000 },
    ]
  },
  {
    id: '3',
    username: 'competitor.beta',
    name: 'Beta Analytics',
    profile_picture_url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=200&h=200&auto=format&fit=crop',
    followers_count: 8500,
    follows_count: 1200,
    media_count: 89,
    is_own: false,
    engagement_rate: 6.5,
    biography: 'Dados e insights reais para o seu negócio.',
    history: [
      { date: '11/06', followers: 8200, engagement: 6.2, reach: 4000, impressions: 7000 },
      { date: 'Today', followers: 8500, engagement: 6.5, reach: 4500, impressions: 7500 },
    ]
  }
];

const InstagramPage: React.FC = () => {
  const [accounts, setAccounts] = useState<InstagramAccount[]>(MOCK_INSTAGRAM_ACCOUNTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'own' | 'competitor'>('competitor');
  const [newHandle, setNewHandle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeAccount, setActiveAccount] = useState<InstagramAccount | null>(MOCK_INSTAGRAM_ACCOUNTS[0]);

  const handleAddAccount = () => {
    if (!newHandle) return;
    
    setIsSearching(true);
    // Simulate searching/adding
    setTimeout(() => {
      const newAcc: InstagramAccount = {
        id: Math.random().toString(36).substr(2, 9),
        username: newHandle.replace('@', ''),
        name: newHandle.replace('@', '').split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        profile_picture_url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?q=80&w=200&h=200&auto=format&fit=crop`,
        followers_count: Math.floor(Math.random() * 50000) + 1000,
        follows_count: Math.floor(Math.random() * 2000),
        media_count: Math.floor(Math.random() * 300),
        is_own: addMode === 'own',
        engagement_rate: parseFloat((Math.random() * 8).toFixed(1)),
        history: [
            { date: '11/06', followers: 1000, engagement: 2.0, reach: 500, impressions: 1000 },
            { date: 'Today', followers: 1200, engagement: 2.5, reach: 600, impressions: 1200 },
        ]
      };
      
      setAccounts(prev => [...prev, newAcc]);
      setIsSearching(false);
      setIsAddModalOpen(false);
      setNewHandle('');
    }, 1500);
  };

  const removeAccount = (id: string) => {
    if (window.confirm('Deseja remover este perfil?')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      if (activeAccount?.id === id) setActiveAccount(accounts.find(a => a.id !== id) || null);
    }
  };

  const ownAccount = accounts.find(a => a.is_own);
  const competitors = accounts.filter(a => !a.is_own);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Instagram className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Inteligência Insta
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitore seu crescimento e analise seus concorrentes em tempo real.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setAddMode('own'); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-all font-bold text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Minha Conta
          </button>
          <button 
            onClick={() => { setAddMode('competitor'); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <Users className="w-4 h-4" /> Add Concorrente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Accounts List & Comparison Small Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" /> Contas Monitoradas
              </h3>
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase">
                {accounts.length} Total
              </span>
            </div>
            <div className="p-2 space-y-1">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setActiveAccount(acc)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activeAccount?.id === acc.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-100 dark:ring-blue-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <img src={acc.profile_picture_url} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700" alt="" />
                    {acc.is_own && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full border-2 border-white dark:border-gray-900">
                        <ShieldCheck className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${activeAccount?.id === acc.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>@{acc.username}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      {acc.followers_count.toLocaleString()} seguidores
                    </p>
                  </div>
                  {activeAccount?.id === acc.id && (
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Comparison Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" /> Benchmark
            </h3>
            <div className="space-y-4">
              {accounts.sort((a,b) => b.engagement_rate - a.engagement_rate).map((acc) => (
                <div key={acc.id} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-gray-600 dark:text-gray-400">@{acc.username}</span>
                    <span className={`${acc.engagement_rate > 5 ? 'text-emerald-500' : 'text-blue-500'}`}>{acc.engagement_rate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(acc.engagement_rate / 10) * 100}%` }}
                      className={`h-full rounded-full ${acc.is_own ? 'bg-blue-600' : 'bg-gray-400'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Account Insights */}
        <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeAccount ? (
                <motion.div 
                  key={activeAccount.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Profile Header Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 sm:p-10 relative overflow-hidden transition-all">
                    {/* Gradient Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                      <div className="relative group">
                        <img 
                          src={activeAccount.profile_picture_url} 
                          className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-800 relative z-10 shadow-lg" 
                          alt="" 
                        />
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">@{activeAccount.username}</h2>
                          <div className="flex justify-center md:justify-start gap-2">
                             {activeAccount.is_own && (
                                <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest border border-blue-100 dark:border-blue-800">Sua Conta</span>
                             )}
                             {!activeAccount.is_own && (
                                <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest">Monitorada</span>
                             )}
                          </div>
                        </div>
                        
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto md:mx-0">{activeAccount.biography}</p>
                        
                        <div className="flex justify-center md:justify-start gap-8 pt-2">
                          <div className="text-center md:text-left">
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{activeAccount.followers_count.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seguidores</p>
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-xl font-bold text-gray-800 dark:text-white">{activeAccount.media_count}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Posts</p>
                          </div>
                          <div className="text-center md:text-left">
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{activeAccount.engagement_rate}%</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Engajamento</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-600 rounded-lg transition-all border border-gray-100 dark:border-gray-700"><ExternalLink className="w-4 h-4" /></button>
                        {!activeAccount.is_own && (
                            <button 
                                onClick={() => removeAccount(activeAccount.id)}
                                className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-lg transition-all border border-gray-100 dark:border-gray-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Growth Chart Section */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" /> Crescimento de Seguidores
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">Histórico recente</p>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                           <button className="px-3 py-1 text-[10px] font-black bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded shadow-sm">7D</button>
                           <button className="px-3 py-1 text-[10px] font-black text-gray-400">30D</button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeAccount.history}>
                                <defs>
                                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                                />
                                <YAxis 
                                    hide 
                                    domain={['dataMin - 100', 'dataMax + 100']}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        background: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="followers" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorFollowers)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        {[
                            { label: 'Alcance Médio', value: '7.4k', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Impressões', value: '11.2k', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
                            { label: 'Likes Médios', value: '3.1k', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                            { label: 'Comentários', value: '450', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
                                <div className={`w-8 h-8 ${stat.bg} dark:bg-gray-800 rounded-lg flex items-center justify-center ${stat.color} mb-3`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <p className="text-xl font-bold text-gray-800 dark:text-white leading-none">{stat.value}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
                    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-300">
                        <Instagram className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">Nenhuma conta ativa</h3>
                    <p className="text-gray-500 max-w-xs">Selecione uma conta ao lado ou adicione uma nova para começar a monitorar.</p>
                </div>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsAddModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl w-full max-w-md p-10 border border-gray-100 dark:border-gray-800"
          >
            <div className="text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg">
                    <Instagram className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {addMode === 'own' ? 'Conectar Minha Conta' : 'Adicionar Concorrente'}
                </h2>
                <p className="text-sm font-medium text-gray-500">
                    {addMode === 'own' 
                        ? 'Conecte sua conta via Graph API para ter acesso a insights privilegiados.' 
                        : 'Saiba o que seus concorrentes estão fazendo e supere-os.'}
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Instagram Handle</label>
                    <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">@</div>
                        <input 
                            type="text" 
                            value={newHandle}
                            onChange={(e) => setNewHandle(e.target.value)}
                            placeholder="username"
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleAddAccount}
                    disabled={isSearching || !newHandle}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 dark:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : (addMode === 'own' ? 'Conectar via Facebook' : 'Iniciar Monitoramento')}
                </button>
                
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest py-2"
                >
                  Cancelar
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InstagramPage;
