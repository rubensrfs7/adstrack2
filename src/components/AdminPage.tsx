
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, Users, Link as LinkIcon, MousePointer2, Activity, 
  Trash2, Search, ArrowLeft, Mail, Calendar, AlertTriangle, Plus, X, Loader2,
  Settings, Globe, Eye, EyeOff, Save, Play, CheckCircle2, XCircle, Clock, Webhook,
  MoreVertical, Pencil, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS } from '../constants';
import { AdminUser } from '../types';
import { getWebhookConfig, saveWebhookConfig, getWebhookLogs, triggerWebhook, WebhookLog } from '../services/webhookService';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'api'>('users');
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Supervisor'
  });

  // API Settings State
  const [apiConfig, setApiConfig] = useState(getWebhookConfig());
  const [showToken, setShowToken] = useState(false);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const fetchLogs = () => {
      if (activeTab === 'api') {
        setLogs(getWebhookLogs());
      }
    };
    fetchLogs();
  }, [activeTab]);

  const handleSaveApi = () => {
    saveWebhookConfig(apiConfig);
    alert('Configuração salva com sucesso!');
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    const testData = {
      id: "lead-test-123",
      name: "Lead de Teste",
      email: "teste@adstrack.com.br",
      phone: "5511999999999",
      source: "Teste",
      campaign: "Campanha Teste",
      medium: "Admin",
      content: "Botão Testar",
      created_at: new Date().toISOString()
    };
    await triggerWebhook(testData);
    setLogs(getWebhookLogs());
    setIsTesting(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const totalCampaigns = users.reduce((acc, user) => acc + user.campaignsCount, 0);
  const totalClicks = users.reduce((acc, user) => acc + user.clicksCount, 0);
  const activeRate = "100%"; 

  const handleDeleteClick = (user: AdminUser) => {
    setDeleteId(user.id);
    setOpenMenuId(null);
  };

  const handleEditClick = (user: AdminUser) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleGenerateAccess = (user: AdminUser) => {
    setOpenMenuId(null);
    alert(`Acesso gerado com sucesso para ${user.name}! Um link de login foi enviado para ${user.email}.`);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsEditing(true);
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
      setIsEditing(false);
      setIsEditModalOpen(false);
      setEditingUser(null);
      alert('Usuário atualizado com sucesso!');
    }, 800);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    setTimeout(() => {
      const user: AdminUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'Ativo',
        campaignsCount: 0,
        clicksCount: 0,
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`
      };
      
      setUsers(prev => [user, ...prev]);
      setIsCreating(false);
      setIsCreateModalOpen(false);
      setNewUser({ name: '', email: '', role: 'Supervisor' });
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
          >
              <ArrowLeft className="w-5 h-5" /> <span className="sr-only">Voltar</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Dashboard Admin
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">AdsTrack - Painel Administrativo</p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'api' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Webhook
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-start">
                     <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Usuários</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalUsers}</h3>
                        <p className="text-xs text-gray-400 mt-1">{totalUsers} ativos</p>
                     </div>
                     <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                     </div>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-start">
                     <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Campanhas</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalCampaigns}</h3>
                        <p className="text-xs text-gray-400 mt-1">Em todas as contas</p>
                     </div>
                     <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                     </div>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-start">
                     <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Cliques</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalClicks.toLocaleString()}</h3>
                        <p className="text-xs text-gray-400 mt-1">Todos os tempos</p>
                     </div>
                     <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <MousePointer2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                     </div>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="flex justify-between items-start">
                     <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Atividade</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{activeRate}</h3>
                        <p className="text-xs text-gray-400 mt-1">Usuários ativos</p>
                     </div>
                     <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                     </div>
                 </div>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Usuários Registrados</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lista de todos os usuários e suas estatísticas</p>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Buscar usuário..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                          />
                      </div>
                      <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Novo Supervisor
                      </button>
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">
                              <th className="p-4">Usuário</th>
                              <th className="p-4">Email</th>
                              <th className="p-4 text-center">Tipo</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 text-center">Campanhas</th>
                              <th className="p-4 text-center">Cliques</th>
                              <th className="p-4">Cadastro</th>
                              <th className="p-4 text-right">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {filteredUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-8 h-8 rounded-full" />
                                          <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{user.name}</span>
                                      </div>
                                  </td>
                                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center gap-2">
                                          <Mail className="w-3 h-3 text-gray-400" />
                                          {user.email}
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                          user.role === 'Admin' 
                                          ? 'bg-blue-600 text-white' 
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                      }`}>
                                          {user.role}
                                      </span>
                                  </td>
                                  <td className="p-4 text-center">
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                          user.status === 'Ativo' 
                                          ? 'bg-blue-600 text-white' 
                                          : 'bg-red-100 text-red-600'
                                      }`}>
                                          {user.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center justify-center gap-1">
                                          <LinkIcon className="w-3 h-3 text-gray-400" />
                                          {user.campaignsCount}
                                      </div>
                                  </td>
                                  <td className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center justify-center gap-1">
                                          <MousePointer2 className="w-3 h-3 text-gray-400" />
                                          {user.clicksCount.toLocaleString()}
                                      </div>
                                  </td>
                                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center gap-2">
                                          <Calendar className="w-3 h-3 text-gray-400" />
                                          {new Date(user.joinedAt).toLocaleDateString('pt-BR')}
                                      </div>
                                  </td>
                                  <td className="p-4 text-right relative">
                                      {user.role !== 'Admin' && (
                                          <div className="flex justify-end">
                                              <button 
                                                onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                              >
                                                  <MoreVertical className="w-4 h-4" />
                                              </button>

                                              {openMenuId === user.id && (
                                                  <>
                                                      <div 
                                                          className="fixed inset-0 z-10" 
                                                          onClick={() => setOpenMenuId(null)}
                                                      ></div>
                                                      <div className="absolute right-4 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                          <button 
                                                              onClick={() => handleEditClick(user)}
                                                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                          >
                                                              <Pencil className="w-4 h-4" />
                                                              Editar
                                                          </button>
                                                          <button 
                                                              onClick={() => handleGenerateAccess(user)}
                                                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                          >
                                                              <Key className="w-4 h-4" />
                                                              Gerar acesso
                                                          </button>
                                                          <button 
                                                              onClick={() => handleDeleteClick(user)}
                                                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                                                          >
                                                              <Trash2 className="w-4 h-4" />
                                                              Excluir
                                                          </button>
                                                      </div>
                                                  </>
                                              )}
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          Nenhum usuário encontrado.
                      </div>
                  )}
              </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* API Configuration Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 p-10 flex flex-col">
            <div className="flex items-center gap-3 mb-10">
              <Webhook className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-white">Configuração de Webhook</h3>
            </div>

            <div className="space-y-8 flex-1">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">ENDPOINT (POST)</label>
                <input 
                  type="url" 
                  value={apiConfig.endpoint}
                  onChange={(e) => setApiConfig({ ...apiConfig, endpoint: e.target.value })}
                  placeholder="https://seuservidor.com.br"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-0 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Sempre que um novo lead entrar, enviaremos um JSON com os dados para este endereço. Deixe em branco para desativar.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">TOKEN DE AUTORIZAÇÃO <span className="opacity-60">(opcional)</span></label>
                <div className="relative">
                  <input 
                    type={showToken ? "text" : "password"} 
                    value={apiConfig.token}
                    onChange={(e) => setApiConfig({ ...apiConfig, token: e.target.value })}
                    placeholder="Bearer token ou chave de API..."
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button 
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-5 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-medium">Enviado no header <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">Authorization</code> de cada requisição.</p>
              </div>

              <div className="bg-[#F9FAFB] dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Payload exemplo</span>
                </div>
                <pre className="text-[11px] font-mono text-gray-500 dark:text-gray-400 overflow-x-auto leading-relaxed">
{`{
  "id": "lead-123",
  "name": "Nome do Lead",
  "email": "lead@exemplo.com",
  "phone": "5511999999999",
  "source": "Facebook",
  "campaign": "Campanha",
  "medium": "Medium",
  "content": "Content",
  "created_at": "2024-03-20T10:00:00Z"
}`}
                </pre>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={handleTestApi}
                disabled={isTesting || !apiConfig.endpoint}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4" />}
                Testar Disparo
              </button>
              <button 
                onClick={handleSaveApi}
                className="flex-[1.5] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-100 dark:shadow-none"
              >
                <Save className="w-5 h-5" />
                Salvar Configuração
              </button>
            </div>
          </div>

          {/* History Column */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800 p-10 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-white">Histórico de Disparos</h3>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">Últimos 50</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                  <Activity className="w-12 h-12 opacity-20 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-sm">Nenhum disparo realizado</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:border-blue-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.status === 'success' ? 'Sucesso' : 'Falha'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{log.endpoint}</p>
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 break-words">
                          <span className="font-bold text-blue-600">Response:</span> {log.response}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setDeleteId(null)}></div>
           <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center">
                 <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Excluir Usuário?</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Tem certeza que deseja remover este usuário do sistema? Esta ação apagará todos os dados e campanhas associadas.
                 </p>
                 <div className="flex w-full gap-3">
                    <button 
                       onClick={() => setDeleteId(null)}
                       className="flex-1 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                       Cancelar
                    </button>
                    <button 
                       onClick={confirmDelete}
                       className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-colors"
                    >
                       Sim, Excluir
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setIsEditModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Pencil className="w-5 h-5 text-blue-600" /> 
                    Editar Usuário
                 </h3>
                 <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                 </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                    <input 
                       type="text" 
                       required
                       value={editingUser.name}
                       onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                    <input 
                       type="email" 
                       required
                       value={editingUser.email}
                       onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Acesso</label>
                    <select 
                       value={editingUser.role}
                       onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as AdminUser['role'] })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                       <option value="Admin">Admin</option>
                       <option value="Supervisor">Supervisor</option>
                       <option value="User">Usuário</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                       value={editingUser.status}
                       onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'Ativo' | 'Inativo' })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                       <option value="Ativo">Ativo</option>
                       <option value="Inativo">Inativo</option>
                    </select>
                 </div>
                 <div className="pt-4">
                    <button 
                       type="submit" 
                       disabled={isEditing}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                       {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}
                    </button>
                 </div>
              </form>
           </div>
        </div>,
        document.body
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setIsCreateModalOpen(false)}></div>
           <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" /> 
                    Novo Supervisor
                 </h3>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                 </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                    <input 
                       type="text" 
                       required
                       value={newUser.name}
                       onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Ex: João Silva"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                    <input 
                       type="email" 
                       required
                       value={newUser.email}
                       onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="joao@exemplo.com"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Acesso</label>
                    <select 
                       value={newUser.role}
                       onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                       <option value="Supervisor">Supervisor (Visualização)</option>
                       <option value="Básico">Básico</option>
                    </select>
                 </div>
                 <div className="pt-4">
                    <button 
                       type="submit" 
                       disabled={isCreating}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                       {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Cadastro'}
                    </button>
                 </div>
              </form>
           </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminPage;
