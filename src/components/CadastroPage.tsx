
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Search, Filter, Plus, Mail, Phone, MoreVertical, X, Loader2, Save, UserPlus, Edit2, Key, Trash2, Copy, ExternalLink, Link as Link2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useRole } from '../hooks/useRole';

interface Supervisor {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

const CadastroPage: React.FC = () => {
  const { isAdmin } = useRole();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [newSupervisor, setNewSupervisor] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchSupervisors = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setSupervisors([
          { id: '1', full_name: 'Júlio Geovani', email: 'julio.guimaraes@mzwkspace.com', phone: '(79) 99849-6158', role: 'Supervisor', created_at: new Date().toISOString() },
          { id: '2', full_name: 'Igor Michel', email: 'igor.oliveira@mzwkspace.com', phone: '', role: 'Supervisor', created_at: new Date().toISOString() },
          { id: '3', full_name: 'Marcos Vinícius', email: 'marcos.pereira@mzwkspace.com', phone: '', role: 'Supervisor', created_at: new Date().toISOString() },
          { id: '4', full_name: 'Felipe Jordan', email: 'felipe.santos@mzwkspace.com', phone: '', role: 'Supervisor', created_at: new Date().toISOString() },
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Supervisor')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        const mockNew: Supervisor = {
          id: Math.random().toString(36).substr(2, 9),
          full_name: newSupervisor.name,
          email: newSupervisor.email,
          phone: newSupervisor.phone,
          role: 'Supervisor',
          created_at: new Date().toISOString()
        };
        setSupervisors(prev => [...prev, mockNew]);
        setIsModalOpen(false);
        setNewSupervisor({ name: '', email: '', phone: '' });
        return;
      }

      alert("Supervisor cadastrado com sucesso! (Simulação)");
      setIsModalOpen(false);
    } catch (error) {
      alert("Erro ao cadastrar supervisor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este supervisor?")) {
      setSupervisors(prev => prev.filter(s => s.id !== id));
      setActiveMenu(null);
    }
  };

  const handleGenerateAccess = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsAccessModalOpen(true);
    setActiveMenu(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copiado para a área de transferência!");
  };

  const filteredSupervisors = supervisors.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    s.email.toLowerCase().includes(emailFilter.toLowerCase()) &&
    (s.phone || '').includes(phoneFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Supervisores
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie os supervisores</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
        >
          <Plus className="w-5 h-5" /> Novo Supervisor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-gray-700 dark:text-gray-200 font-bold">
          <Filter className="w-4 h-4" /> Filtros
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome</label>
            <input 
              type="text" 
              placeholder="Digite o nome do supervisor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
            <input 
              type="text" 
              placeholder="Digite o email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Telefone</label>
            <input 
              type="text" 
              placeholder="(00) 00000-0000"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 dark:shadow-none">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold uppercase text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="p-5">Nome</th>
              <th className="p-5">Email</th>
              <th className="p-5">Telefone</th>
              <th className="p-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                </td>
              </tr>
            ) : filteredSupervisors.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400 font-bold">
                  Nenhum supervisor encontrado.
                </td>
              </tr>
            ) : filteredSupervisors.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {s.full_name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{s.full_name}</span>
                  </div>
                </td>
                <td className="p-5 text-sm text-gray-500 dark:text-gray-400">{s.email}</td>
                <td className="p-5 text-sm text-gray-500 dark:text-gray-400">{s.phone || '—'}</td>
                <td className="p-5 text-right relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === s.id ? null : s.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeMenu === s.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-12 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 w-48 text-left"
                    >
                      <button className="w-full px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors">
                        <Edit2 className="w-4 h-4" /> Editar
                      </button>
                      <button 
                        onClick={() => handleGenerateAccess(s)}
                        className="w-full px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                      >
                        <Key className="w-4 h-4" /> Gerar acesso
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Novo Supervisor</h3>
            </div>
            <form onSubmit={handleCreateSupervisor} className="p-8 pt-4 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
                <input 
                  type="text" 
                  required
                  value={newSupervisor.name}
                  onChange={(e) => setNewSupervisor({...newSupervisor, name: e.target.value})}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input 
                  type="email" 
                  required
                  value={newSupervisor.email}
                  onChange={(e) => setNewSupervisor({...newSupervisor, email: e.target.value})}
                  placeholder="joao@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
                <input 
                  type="text" 
                  value={newSupervisor.phone}
                  onChange={(e) => setNewSupervisor({...newSupervisor, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Criar Supervisor
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Gerar Acesso */}
      {isAccessModalOpen && selectedSupervisor && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsAccessModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Link de Acesso</h3>
            </div>
            
            <div className="p-8 pt-4 space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Envie este link para <span className="font-bold text-gray-700 dark:text-gray-200">{selectedSupervisor.full_name}</span> para que ele possa cadastrar seu login e senha.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link de Ativação</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      readOnly
                      value={`https://app.adstrack.com.br/set-password/${selectedSupervisor.id}`}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 text-xs font-medium text-blue-600 dark:text-blue-400 outline-none"
                    />
                    <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`https://app.adstrack.com.br/set-password/${selectedSupervisor.id}`)}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <Copy className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => window.open(`/set-password/${selectedSupervisor.id}`, '_blank')}
                className="w-full py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Abrir Link
              </button>

              <button 
                onClick={() => setIsAccessModalOpen(false)}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 dark:shadow-none"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CadastroPage;
