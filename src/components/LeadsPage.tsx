
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Download, Webhook, Search, Filter, Mail, Phone, Calendar, 
  CheckCircle2, X, Loader2, Save, Activity, Globe, Zap, ExternalLink,
  Star, MessageSquare, Tag, Clock, ChevronRight, MoreHorizontal, ClipboardList,
  Facebook, Instagram, Music, LayoutGrid, List, ChevronDown
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Lead, FormResponse } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useRole } from '../hooks/useRole';

const getSourceIcon = (source: string) => {
  switch(source.toLowerCase()) {
    case 'facebook': return <Facebook className="w-3 h-3 text-blue-600" />;
    case 'instagram': return <Instagram className="w-3 h-3 text-pink-500" />;
    case 'tiktok': return <img src="https://v4d.mz-css.net/72363bc2e4e6ae3d1f04fa8813b83acf/ebf794d02231ae3927e08af8cb0352f0/vecteezy_tiktok-png-icon_16716450.png" alt="TikTok" className="w-3 h-3" />;
    case 'google':
    case 'google ads': return <img src="https://v4d.mz-css.net/72363bc2e4e6ae3d1f04fa8813b83acf/c8458652917e1b282bfbfac9ea664aeb/vecteezy_google-search-icon-google-product-illustration_12871371.png" alt="Google" className="w-3 h-3" />;
    case 'x':
    case 'twitter': return <img src="https://v4d.mz-css.net/72363bc2e4e6ae3d1f04fa8813b83acf/73dd18a69543874078d876f43390b763/vecteezy_new-twitter-x-logo-twitter-icon-x-social-media-icon_42148611.png" alt="X" className="w-3 h-3" />;
    default: return <Globe className="w-3 h-3 text-gray-500" />;
  }
}

// Gerador de Dados Mocados
const generateMockLeads = (count: number): Lead[] => {
  const sources = ['Facebook', 'Google Ads', 'Instagram', 'Organic', 'TikTok'];
  const campaigns = ['Lançamento Verão', 'Black Friday', 'E-book Grátis', 'Webinar Investimentos', 'Desafio 30 Dias'];
  const statuses = ['Novo', 'Contatado', 'Convertido', 'Perdido'] as const;

  return Array.from({ length: count }).map((_, i) => ({
    id: `lead-${i + 1}`,
    name: `Lead Teste ${i + 1}`,
    email: `contato${i + 1}@empresa.com`,
    phone: `55119${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
    created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
    score: Math.floor(Math.random() * 100)
  }));
};

const LeadsPage: React.FC = () => {
  const { isSupervisor } = useRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [leadFormResponse, setLeadFormResponse] = useState<FormResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusPosition, setStatusPosition] = useState({ top: 0, left: 0, width: 0 });
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  
  const toggleStatus = () => {
    if (!isStatusOpen && statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      setStatusPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    }
    setIsStatusOpen(!isStatusOpen);
  };
  
  // Webhook State
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(false);

  useEffect(() => {
    // Carregar configuração salva
    const savedUrl = localStorage.getItem('leadtracker_webhook_url');
    if (savedUrl) {
      setWebhookUrl(savedUrl);
      setWebhookConfigured(true);
    }

    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Simula carregamento de dados mockados
        await new Promise(resolve => setTimeout(resolve, 800));
        setLeads(generateMockLeads(50));
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: Lead['status']) => {
    if (isSupervisor) {
      alert("Supervisores não têm permissão para alterar o status dos leads.");
      return;
    }
    try {
      if (!isSupabaseConfigured) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
        return;
      }

      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do lead.');
    }
  };

  const openLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
    setIsLoadingDetails(true);
    setLeadFormResponse(null);

    try {
      if (!isSupabaseConfigured) {
        // Mock form response for demo
        await new Promise(resolve => setTimeout(resolve, 500));
        setLeadFormResponse({
          id: 'resp-1',
          campaign_id: 'wa-1',
          data: {
            'Qual seu objetivo?': 'Aumentar vendas',
            'Já utiliza Flow?': 'Sim, mas quero trocar',
            'Qual seu orçamento mensal?': 'R$ 5.000 - R$ 10.000'
          },
          utm_context: {
            source: lead.source,
            medium: 'chat',
            campaign: lead.campaign,
            content: 'stories_video'
          },
          creative_context: {
            name: 'Stories Vídeo 01',
            image_url: 'https://picsum.photos/400/400?random=1'
          },
          created_at: lead.created_at
        });
        return;
      }

      // Fetch real form response if available
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('email', lead.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setLeadFormResponse(data);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do lead:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getFilteredChartData = (type: string) => {
    return [
      { name: 'Jan', clicks: Math.floor(Math.random() * 100) },
      { name: 'Feb', clicks: Math.floor(Math.random() * 100) },
      { name: 'Mar', clicks: Math.floor(Math.random() * 100) },
      { name: 'Apr', clicks: Math.floor(Math.random() * 100) },
      { name: 'May', clicks: Math.floor(Math.random() * 100) },
      { name: 'Jun', clicks: Math.floor(Math.random() * 100) },
    ];
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.campaign.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Origem', 'Campanha', 'Data'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(l => [
        l.id,
        `"${l.name}"`,
        l.email,
        l.phone,
        l.source,
        `"${l.campaign}"`,
        new Date(l.created_at).toLocaleDateString('pt-BR') + ' ' + new Date(l.created_at).toLocaleTimeString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebhook(true);

    setTimeout(() => {
      if (webhookUrl) {
        localStorage.setItem('leadtracker_webhook_url', webhookUrl);
        setWebhookConfigured(true);
        alert('Integração configurada com sucesso! Novos leads serão disparados automaticamente.');
        setIsWebhookModalOpen(false);
      } else {
        localStorage.removeItem('leadtracker_webhook_url');
        setWebhookConfigured(false);
        alert('Integração removida.');
      }
      setIsSavingWebhook(false);
    }, 1000);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;
    setIsTestingWebhook(true);
    try {
        // Simulação de disparo
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`Sucesso! Um JSON de teste foi enviado para: ${webhookUrl}`);
    } catch (e) {
        alert('Erro ao testar webhook.');
    } finally {
        setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Gerenciador de Leads
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Lista completa de leads capturados e suas origens.
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isSupervisor && (
            <button 
              onClick={() => setIsWebhookModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors shadow-sm font-bold text-sm ${
                  webhookConfigured 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800 hover:border-blue-500'
              }`}
            >
              {webhookConfigured ? <CheckCircle2 className="w-4 h-4" /> : <Webhook className="w-4 h-4" />} 
              {webhookConfigured ? 'Integração Ativa' : 'Configurar Integração'}
            </button>
          )}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-none text-sm"
          >
            <Download className="w-4 h-4" /> Baixar CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { title: 'TOTAL LEADS', value: leads.length.toLocaleString(), icon: Users, color: 'blue', data: getFilteredChartData('clicks'), percentage: '+12%' },
          { title: 'LEADS HOJE', value: '12', icon: Activity, color: 'emerald', data: getFilteredChartData('today'), percentage: '+18%' },
          { title: 'API', value: webhookConfigured ? 'Ativa' : 'Inativa', icon: Webhook, color: webhookConfigured ? 'purple' : 'gray', data: null, percentage: null },
        ].map((stat, index) => (
          <motion.div 
            key={`${index}`} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-3xl border border-transparent shadow-lg bg-gradient-to-br ${
              stat.color === 'blue' ? 'from-blue-500 to-blue-700' :
              stat.color === 'emerald' ? 'from-emerald-500 to-emerald-700' :
              stat.color === 'purple' ? 'from-purple-500 to-purple-700' :
              'from-gray-500 to-gray-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-2xl bg-white/20 text-white">
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.percentage && (
                  <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full">{stat.percentage}</span>
              )}
            </div>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">{stat.title}</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              {stat.data && (
                <div className="h-10 w-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stat.data}>
                      <Line type="monotone" dataKey="clicks" stroke="#fff" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-zinc-900 shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 dark:bg-[#050505]/40 gap-4">
           <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-black text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 bg-white dark:bg-black border border-gray-200 dark:border-zinc-900 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                 <Filter className="w-4 h-4" />
              </button>
               <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
               </div>
           </div>
        </div>

        {/* Table/Cards */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
               <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : viewMode === 'list' ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-[#050505] text-[10px] font-black uppercase text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-900 tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-4">Nome / Email</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-900 text-sm">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{lead.name}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-mono mt-0.5">
                           <Mail className="w-3 h-3" /> {lead.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded w-fit">
                          <Phone className="w-3 h-3" /> {lead.phone}
                       </div>
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                         lead.status === 'Novo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                         lead.status === 'Contatado' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                         lead.status === 'Convertido' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                         'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                       }`}>
                         {lead.status}
                       </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              lead.score > 70 ? 'bg-green-500' : lead.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{lead.score}</span>
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                             {getSourceIcon(lead.source)} {lead.source}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[150px] mt-0.5">{lead.campaign}</span>
                       </div>
                    </td>
                    <td className="p-4 text-right">
                       <button 
                        onClick={() => openLeadDetails(lead)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                       >
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {filteredLeads.map((lead) => (
                    <div key={lead.id} className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-zinc-900 rounded-lg p-4 shadow-sm hover:border-blue-500 transition-colors cursor-pointer group" onClick={() => openLeadDetails(lead)}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900 dark:text-white">{lead.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                lead.status === 'Novo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                lead.status === 'Contatado' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                lead.status === 'Convertido' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {lead.status}
                            </span>
                        </div>
                        <div className="space-y-1 mb-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-2">
                                <Mail className="w-3 h-3 text-gray-400" /> {lead.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-400" /> {lead.phone}
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                             <div className="flex items-center gap-1">{getSourceIcon(lead.source)} {lead.source}</div>
                             <div className="text-gray-400 text-[10px]">{lead.campaign}</div>
                        </div>
                        <div className="w-full h-1 bg-gray-100 dark:bg-zinc-900 rounded-full mt-2">
                            <div className={`h-full rounded-full ${lead.score > 70 ? 'bg-green-500' : lead.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${lead.score}%` }} />
                        </div>
                    </div>
                ))}
            </div>
          )}
          {!loading && filteredLeads.length === 0 && (
             <div className="p-10 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                Nenhum lead encontrado.
             </div>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {isDetailsModalOpen && selectedLead && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="absolute inset-0" onClick={() => setIsDetailsModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                       <Users className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedLead.name}</h3>
                       <p className="text-xs text-gray-500 font-medium">Lead ID: {selectedLead.id}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    {!isSupervisor && (
                      <div className="relative">
                       <button
                         ref={statusButtonRef}
                         onClick={toggleStatus}
                         className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider outline-none border transition-all flex items-center gap-2 ${
                           selectedLead.status === 'Novo' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                           selectedLead.status === 'Contatado' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                           selectedLead.status === 'Convertido' ? 'bg-green-50 text-green-700 border-green-100' :
                           'bg-red-50 text-red-700 border-red-100'
                         }`}
                       >
                         {selectedLead.status}
                         <ChevronDown className="w-3 h-3" />
                       </button>
                       {isStatusOpen && createPortal(
                         <div 
                           className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] overflow-hidden"
                           style={{ top: `${statusPosition.top}px`, left: `${statusPosition.left}px`, width: `${statusPosition.width}px` }}
                         >
                           {['Novo', 'Contatado', 'Convertido', 'Perdido'].map((status) => (
                             <button
                               key={status}
                               type="button"
                               className={`w-full px-4 py-2 text-xs font-black uppercase tracking-wider text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                 status === 'Novo' ? 'text-blue-700' :
                                 status === 'Contatado' ? 'text-yellow-700' :
                                 status === 'Convertido' ? 'text-green-700' :
                                 'text-red-700'
                               }`}
                               onClick={() => {
                                 handleStatusUpdate(selectedLead.id, status as Lead['status']);
                                 setIsStatusOpen(false);
                               }}
                             >
                               {status}
                             </button>
                           ))}
                         </div>,
                         document.body
                       )}
                     </div>
                    )}
                    <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                       <X className="w-6 h-6 text-gray-400" />
                    </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                       <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <Activity className="w-3 h-3" /> Informações de Contato
                          </h4>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm"><Mail className="w-4 h-4 text-blue-500" /></div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] text-gray-400 font-bold uppercase">Email</span>
                                   <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{selectedLead.email}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm"><Phone className="w-4 h-4 text-green-500" /></div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] text-gray-400 font-bold uppercase">WhatsApp</span>
                                   <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{selectedLead.phone}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm"><Calendar className="w-4 h-4 text-orange-500" /></div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] text-gray-400 font-bold uppercase">Data de Entrada</span>
                                   <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date(selectedLead.created_at).toLocaleString('pt-BR')}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-4">
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                             <Star className="w-3 h-3" /> Lead Scoring
                          </h4>
                          <div className="flex items-center justify-between">
                             <span className="text-4xl font-black text-blue-700 dark:text-blue-300">{selectedLead.score}</span>
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-blue-500 uppercase">Qualificação</p>
                                <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                                   {selectedLead.score > 80 ? 'Excelente' : selectedLead.score > 50 ? 'Bom' : 'Frio'}
                                </p>
                             </div>
                          </div>
                          <div className="w-full h-2 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedLead.score}%` }} />
                          </div>
                       </div>
                    </div>

                    {/* Right Column: Context & Form Data */}
                    <div className="lg:col-span-2 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                {getSourceIcon(selectedLead.source)} Origem do Tráfego
                             </h4>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                   <span className="text-xs text-gray-500 font-bold">Source:</span>
                                   <span className="text-xs font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{selectedLead.source}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-xs text-gray-500 font-bold">Campanha:</span>
                                   <span className="text-xs font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[150px]">{selectedLead.campaign}</span>
                                </div>
                             </div>
                          </div>

                          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3" /> Conversão
                             </h4>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                                   <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-gray-900 dark:text-white">WhatsApp Direct</p>
                                   <p className="text-[10px] text-gray-500 font-medium">Redirecionado com sucesso</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Form Responses Section */}
                       <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardList className="w-3 h-3" /> Respostas do Formulário
                             </h4>
                             {isLoadingDetails && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                          </div>
                          
                          <div className="p-6">
                             {!isLoadingDetails && !leadFormResponse && (
                                <div className="text-center py-10">
                                   <p className="text-xs text-gray-400 font-bold italic">Nenhum formulário preenchido por este lead.</p>
                                </div>
                             )}

                             {leadFormResponse && (
                                <div className="space-y-6">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {Object.entries(leadFormResponse.data).map(([question, answer], i) => (
                                         <div key={i} className="space-y-1.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{question}</p>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                               {String(answer)}
                                            </p>
                                         </div>
                                      ))}
                                   </div>

                                   {/* Creative Context */}
                                   <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Criativo Visualizado</h5>
                                      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                         <img src={leadFormResponse.creative_context.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                                         <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{leadFormResponse.creative_context.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Visualizado antes da conversão</p>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
                 <button 
                  onClick={() => window.open(`https://wa.me/${selectedLead.phone}`, '_blank')}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100 dark:shadow-none"
                 >
                    <MessageSquare className="w-4 h-4" /> Abrir no WhatsApp
                 </button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Configuration Webhook Modal */}
      {isWebhookModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="absolute inset-0" onClick={() => setIsWebhookModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-blue-600" /> Configuração de API
                 </h3>
                 <button onClick={() => setIsWebhookModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="p-6">
                 <form onSubmit={handleSaveWebhook} className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-[0.2em] px-1">Endpoint URL (POST)</label>
                       <input 
                          type="url" 
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://hook.us1.make.com/..."
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                       />
                       <p className="text-[10px] text-gray-400 mt-2 px-1 leading-relaxed">
                          Sempre que um novo lead entrar, enviaremos um JSON com os dados para este endereço. Deixe em branco para desativar.
                       </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
                       <h5 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2"><Activity className="w-3 h-3" /> Exemplo de Payload</h5>
                       <pre className="text-[9px] font-mono text-blue-600/80 dark:text-blue-300 overflow-x-auto whitespace-pre-wrap">
{`{
  "id": "lead-123",
  "name": "Nome do Lead",
  "email": "lead@exemplo.com",
  "phone": "5511999999999",
  "source": "Facebook",
  "created_at": "2024-03-20T10:00:00Z"
}`}
                       </pre>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={handleTestWebhook}
                            disabled={isTestingWebhook || !webhookUrl}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {isTestingWebhook ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Testar Disparo'}
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSavingWebhook}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isSavingWebhook ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Configuração</>}
                        </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeadsPage;
