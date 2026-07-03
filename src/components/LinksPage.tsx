
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Link as LinkIcon, Upload, Plus, Copy, Trash2, Edit, Eye, 
  CheckCircle2, Download, Save, X, Loader2, ExternalLink, ClipboardList, Trash, ListPlus, CircleDot, ChevronDown, Target,
  Type, AlignLeft, Mail, Phone, Calendar, Hash, CheckSquare, Layers, Radio, Filter, XCircle,
  Instagram, Search, Facebook, Music, Globe, Linkedin, Twitter, Link
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campaign, FormField, FieldType, UserProfile } from '../types';
import { MOCK_CAMPAIGNS } from '../constants';
import CampaignModal from './CampaignModal';
import { Logo } from './Logo';
import { useRole } from '../hooks/useRole';

const LinksPage: React.FC = () => {
  const { isSupervisor } = useRole();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'utm' | 'form'>('basic');
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [sourcePosition, setSourcePosition] = useState({ top: 0, left: 0, width: 0 });
  const sourceButtonRef = useRef<HTMLButtonElement>(null);
  
  const toggleSource = () => {
    if (!isSourceOpen && sourceButtonRef.current) {
      const rect = sourceButtonRef.current.getBoundingClientRect();
      setSourcePosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    }
    setIsSourceOpen(!isSourceOpen);
  };
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    originalUrl: '',
    source: '',
    campaign: '',
    medium: '',
    content: '',
    salesCount: 0,
    leadQualification: 'FRIO' as const
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form Builder State
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [pixelId, setPixelId] = useState('');
  const [submitButtonText, setSubmitButtonText] = useState('Enviar Dados');
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);

  const fetchCampaigns = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCampaigns(MOCK_CAMPAIGNS);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileData) setProfile(profileData);

      const { data, error } = await supabase.from('campaigns').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (error) throw error;
      
      const baseUrl = window.location.origin + window.location.pathname;
      
      setCampaigns((data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        originalUrl: item.original_url,
        shortUrl: `${baseUrl}#/r/${item.short_code}`,
        clicks: item.clicks_count || 0,
        salesCount: item.sales_count || 0,
        leadQualification: item.lead_qualification || 'FRIO',
        imageUrl: item.creative_url || 'https://picsum.photos/200/200?grayscale',
        createdAt: item.created_at,
        qrCodeUrl: item.qr_code,
        utm: { source: item.utm_source || '', medium: item.utm_medium || '', campaign: item.utm_campaign || '', content: item.utm_content || '' },
        creativeName: item.utm_content || 'Genérico',
        adSetName: item.utm_medium || 'Genérico',
        status: item.is_active ? 'active' : 'inactive',
        formConfig: item.form_config
      })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filteredCampaigns = campaigns.filter(c => {
    const cDate = new Date(c.createdAt);
    
    if (startDate) {
      const start = new Date(startDate);
      if (cDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Final do dia selecionado
      if (cDate > end) return false;
    }

    return true;
  });

  const handleAddField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      type: 'text',
      required: true,
      options: []
    };
    setFormFields([...formFields, newField]);
  };

  const handleRemoveField = (id: any) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const updateField = (id: any, updates: any) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleAddOption = (fieldId: any) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        const currentOptions = f.options || [];
        return { ...f, options: [...currentOptions, `Opção ${currentOptions.length + 1}`] };
      }
      return f;
    }));
  };

  const updateOption = (fieldId: any, optionIndex: any, newValue: any) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId && f.options) {
        const newOptions = [...f.options];
        newOptions[optionIndex] = newValue;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const removeOption = (fieldId: any, optionIndex: any) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId && f.options) {
        return { ...f, options: f.options.filter((_, idx) => idx !== optionIndex) };
      }
      return f;
    }));
  };

  const handleInputChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', originalUrl: '', source: '', campaign: '', medium: '', content: '', salesCount: 0, leadQualification: 'FRIO' });
    setImagePreview(null);
    setEditingId(null);
    setIsFormVisible(false);
    setIsFormEnabled(false);
    setFormFields([]);
    setPixelId('');
    setSubmitButtonText('Enviar Dados');
    setCurrentPreviewStep(0);
    setActiveTab('basic');
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isSupervisor) {
      alert("Supervisores não têm permissão para criar ou editar links.");
      return;
    }
    if (!isSupabaseConfigured) {
        alert("Modo Demo: Alterações não são salvas.");
        resetForm();
        return;
    }
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const shortCode = editingId ? campaigns.find(c => c.id === editingId)?.shortUrl.split('/r/')[1] : Math.random().toString(36).substr(2, 6);
    const baseUrl = window.location.origin + window.location.pathname;
    const finalShortUrl = `${baseUrl}#/r/${shortCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(finalShortUrl)}`;
    
    const dbPayload = { 
        name: formData.name, 
        original_url: formData.originalUrl, 
        utm_source: formData.source, 
        utm_medium: formData.medium, 
        utm_campaign: formData.campaign, 
        utm_content: formData.content, 
        creative_url: imagePreview, 
        qr_code: qrCodeUrl, 
        user_id: session.user.id,
        sales_count: formData.salesCount,
        lead_qualification: formData.leadQualification,
        form_config: isFormEnabled ? { 
          title: formData.name,
          fields: formFields, 
          submitButtonText: submitButtonText,
          pixelId: pixelId 
        } : null
    };

    try {
        if (editingId) {
            await supabase.from('campaigns').update(dbPayload).eq('id', editingId);
        } else {
            await supabase.from('campaigns').insert([{ ...dbPayload, short_code: shortCode, clicks_count: 0, is_active: true }]);
        }
        await fetchCampaigns();
        resetForm();
    } catch (error) {
        alert('Erro ao salvar no banco.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEdit = (campaign: any) => {
    setEditingId(campaign.id);
    setFormData({ 
      name: campaign.name, 
      originalUrl: campaign.originalUrl, 
      source: campaign.utm.source, 
      campaign: campaign.utm.campaign, 
      medium: campaign.utm.medium, 
      content: campaign.utm.content,
      salesCount: campaign.salesCount || 0,
      leadQualification: campaign.leadQualification || 'FRIO'
    });
    setImagePreview(campaign.imageUrl);
    if (campaign.formConfig) {
      setIsFormEnabled(true);
      setFormFields(campaign.formConfig.fields);
      setPixelId(campaign.formConfig.pixelId || '');
      setSubmitButtonText(campaign.formConfig.submitButtonText || 'Enviar Dados');
    }
    setIsFormVisible(true);
  };

  const handleDelete = async (id: any) => {
    if (isSupervisor) {
      alert("Supervisores não têm permissão para excluir links.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir esta campanha?")) return;
    if (!isSupabaseConfigured) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        return;
    }
    await supabase.from('campaigns').delete().eq('id', id);
    fetchCampaigns();
  };

  const handleCopy = (shortUrl: any, id: any) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFieldPreviewInput = (field: any) => {
    const baseClass = "w-full px-5 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 text-gray-400 text-sm outline-none cursor-not-allowed font-medium";
    
    switch (field.type) {
      case 'text': return <input type="text" placeholder="Resposta curta..." className={baseClass} disabled />;
      case 'long_text': return <textarea placeholder="Resposta longa..." className={baseClass} rows={1} disabled />;
      case 'email': return <div className="relative"><Mail className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="email" placeholder="email@exemplo.com" className={`${baseClass} pl-12`} disabled /></div>;
      case 'phone': return <div className="relative"><Phone className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="text" placeholder="(00) 00000-0000" className={`${baseClass} pl-12`} disabled /></div>;
      case 'date': return <div className="relative"><Calendar className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="date" className={`${baseClass} pl-12`} disabled /></div>;
      case 'number': return <div className="relative"><Hash className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="number" placeholder="0" className={`${baseClass} pl-12`} disabled /></div>;
      case 'multiple_choice': return <div className="flex gap-4 px-2">{(field.options || ['Opção 1', 'Opção 2']).slice(0, 2).map((o: any, i: any) => <div key={i} className="flex items-center gap-2 text-xs text-gray-400 font-bold"><Radio className="w-4 h-4" /> {o}</div>)}</div>;
      case 'checkbox': return <div className="flex gap-4 px-2">{(field.options || ['Opção A', 'Opção B']).slice(0, 2).map((o: any, i: any) => <div key={i} className="flex items-center gap-2 text-xs text-gray-400 font-bold"><CheckSquare className="w-4 h-4" /> {o}</div>)}</div>;
      case 'dropdown': return <div className="relative"><Layers className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><div className={`${baseClass} pl-12 flex justify-between items-center`}>Selecionar... <ChevronDown className="w-4 h-4" /></div></div>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Gerenciador de Links
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Crie links rastreáveis com formulários e tracking de Pixel.</p>
        </div>
        {!isSupervisor && (
          <button 
            onClick={() => { resetForm(); setIsFormVisible(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-bold"
          >
            <Plus className="w-5 h-5" /> Criar Link Rastreável
          </button>
        )}
      </div>

      {/* Date Filter Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4">
         <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filtros:
         </div>
         
         <div className="flex items-center gap-2">
            <div className="relative">
               <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
               <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
               />
            </div>
            <span className="text-gray-400 font-bold text-xs">ATÉ</span>
            <div className="relative">
               <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
               <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
               />
            </div>
         </div>

         {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="ml-auto text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
            >
               <XCircle className="w-4 h-4" /> Limpar
            </button>
         )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCampaigns.length === 0 ? (
             <div className="col-span-full py-16 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
                <Filter className="w-12 h-12 mb-4 opacity-30" />
                <p className="font-bold text-sm uppercase tracking-wider">Nenhuma campanha encontrada neste período.</p>
             </div>
          ) : filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col transition-all group">
                <div className="relative h-80 bg-gray-100 dark:bg-black">
                    <img src={campaign.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <div className="text-white">
                            <h3 className="font-bold text-lg leading-tight truncate w-full">{campaign.name}</h3>
                            <p className="text-[10px] opacity-80 font-mono truncate">{campaign.shortUrl}</p>
                        </div>
                    </div>
                    {campaign.formConfig && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                          <ClipboardList className="w-3 h-3" /> FORM
                        </span>
                        {campaign.formConfig.pixelId && (
                          <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                            <Target className="w-3 h-3" /> PIXEL
                          </span>
                        )}
                      </div>
                    )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 border border-blue-100 dark:border-blue-800/50">
                            <span className="text-[9px] text-blue-500 dark:text-blue-400 uppercase font-black block mb-1">Clicks</span>
                            <span className="text-xl font-black text-blue-700 dark:text-blue-300">{campaign.clicks.toLocaleString()}</span>
                        </div>
                        <div className="text-center bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 border border-blue-100 dark:border-blue-800/50">
                            <span className="text-[9px] text-blue-500 dark:text-blue-400 uppercase font-black block mb-1">Vendas</span>
                            <span className="text-xl font-black text-blue-700 dark:text-blue-300">{campaign.salesCount || 0}</span>
                        </div>
                        <div className="text-center bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2 border border-blue-100 dark:border-blue-800/50 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-blue-500 dark:text-blue-400 uppercase font-black block mb-1">Lead</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              campaign.leadQualification === 'QUENTE' ? 'bg-orange-500 text-white' :
                              campaign.leadQualification === 'MORNO' ? 'bg-yellow-500 text-white' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {campaign.leadQualification || 'FRIO'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-2">
                            {!isSupervisor && (
                              <>
                                <button onClick={() => handleEdit(campaign)} className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(campaign.id)} className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                            <button 
                                onClick={() => handleCopy(campaign.shortUrl, campaign.id)}
                                className={`p-2.5 rounded-lg transition-all ${copiedId === campaign.id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white'}`}
                                title="Copiar Link"
                            >
                                {copiedId === campaign.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={() => { setSelectedCampaign(campaign); setIsDetailsModalOpen(true); }} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"><Eye className="w-4 h-4" /> Detalhes</button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}

      {isFormVisible && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="absolute inset-0" onClick={() => !isSubmitting && setIsFormVisible(false)}></div>
           <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 animate-in zoom-in-95">
              <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center p-8 pb-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">{editingId ? 'Editar Campanha' : 'Criar Nova Campanha'}</h2>
                  <button onClick={() => setIsFormVisible(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X className="w-7 h-7 text-gray-400" /></button>
                </div>
                <div className="px-8 flex gap-8">
                  {[{ id: 'basic', label: 'Básico', icon: LinkIcon }, { id: 'utm', label: 'UTMs', icon: ListPlus }, { id: 'form', label: 'Formulário', icon: ClipboardList }, { id: 'qualification', label: 'Qualificação', icon: CheckCircle2 }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-4 text-sm font-black border-b-[3px] transition-all uppercase tracking-wider ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 pb-60 bg-gray-50/50 dark:bg-gray-950/20">
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Nome da Campanha</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Lead Magnet Janeiro" className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none" required /></div>
                        <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">URL Original</label><input type="url" name="originalUrl" value={formData.originalUrl} onChange={handleInputChange} placeholder="https://seusite.com/obrigado" className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none" required /></div>
                    </div>
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Imagem</label><label className="flex flex-col items-center justify-center w-full h-60 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 bg-white dark:bg-gray-800 transition-all cursor-pointer overflow-hidden">{imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="text-center text-gray-300"><Upload className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm font-black uppercase tracking-widest">Upload</p></div>}<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label></div>
                  </div>
                )}
                {activeTab === 'utm' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div key="source" className="relative">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Origem</label>
                      <button 
                        type="button" 
                        ref={sourceButtonRef}
                        onClick={toggleSource}
                        className="w-full flex items-center justify-between px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none" 
                      >
                        {formData.source ? (
                           <span className="flex items-center gap-2">
                             {(() => {
                               const Icon = [
                                { name: 'Instagram', icon: Instagram },
                                { name: 'Google', icon: Search },
                                { name: 'Facebook', icon: Facebook },
                                { name: 'TikTok', icon: Music },
                                { name: 'Organic', icon: Globe },
                                { name: 'Linkedin', icon: Linkedin },
                                { name: 'X', icon: Twitter },
                                { name: 'Outros', icon: Link }
                               ].find(o => o.name === formData.source)?.icon;
                               return Icon ? <Icon className="w-4 h-4" /> : null;
                             })()}
                             {formData.source}
                           </span>
                        ) : <span className="text-gray-400">Selecione a Origem</span>}
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      {isSourceOpen && createPortal(
                        <div 
                          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
                          style={{ top: `${sourcePosition.top}px`, left: `${sourcePosition.left}px`, width: `${sourcePosition.width}px` }}
                        >
                          {[
                            { name: 'Instagram', icon: Instagram },
                            { name: 'Google', icon: Search },
                            { name: 'Facebook', icon: Facebook },
                            { name: 'TikTok', icon: Music },
                            { name: 'Organic', icon: Globe },
                            { name: 'Linkedin', icon: Linkedin },
                            { name: 'X', icon: Twitter },
                            { name: 'Outros', icon: Link }
                          ].map(opt => (
                             <button
                                key={opt.name}
                                type="button"
                                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white text-left"
                                onClick={() => {
                                    setFormData(prev => ({...prev, source: opt.name}));
                                    setIsSourceOpen(false);
                                }}
                             >
                                <opt.icon className="w-4 h-4" />
                                <span>{opt.name}</span>
                             </button>
                          ))}
                        </div>,
                        document.body
                      )}
                    </div>
                    {[{ name: 'medium', label: 'Conjunto', placeholder: 'cpc' }, { name: 'campaign', label: 'Campanha', placeholder: 'promo' }, { name: 'content', label: 'Criativo', placeholder: 'video' }].map(f => (
                      <div key={f.name}><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">{f.label}</label><input type="text" name={f.name} value={(formData as any)[f.name]} onChange={handleInputChange} placeholder={f.placeholder} className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg" required /></div>
                    ))}
                  </div>
                )}
                {activeTab === 'form' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in slide-in-from-right-4">
                    <div className="xl:col-span-2 space-y-8">
                      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-6 rounded-lg border">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${isFormEnabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <ClipboardList className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 dark:text-white text-lg">Ativar Formulário</p>
                            <p className="text-sm text-gray-500 font-medium">Capture leads antes do redirecionamento</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setIsFormEnabled(!isFormEnabled)} className={`w-16 h-8 rounded-full transition-all relative ${isFormEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isFormEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                      {isFormEnabled && (
                        <div className="space-y-8">
                          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border space-y-6">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Texto do botão de envio</label>
                            <input 
                              type="text" 
                              value={submitButtonText} 
                              onChange={(e) => setSubmitButtonText(e.target.value)} 
                              placeholder="Ex: Chamar vendedor" 
                              className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                            />
                          </div>

                          <div className="bg-blue-500/10 p-8 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-5">
                            <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400 mb-2">
                              <Target className="w-6 h-6" />
                              <h4 className="font-black text-[11px] uppercase tracking-[0.2em]">Facebook Pixel</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                              <div className="space-y-2.5">
                                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">ID do Pixel</label>
                                <input 
                                  type="text" 
                                  value={pixelId} 
                                  onChange={(e) => setPixelId(e.target.value.replace(/\D/g, ''))} 
                                  placeholder="Ex: 123456789" 
                                  className="w-full px-5 py-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-blue-900 dark:text-white font-mono font-bold" 
                                />
                              </div>
                              <div className="pb-2">
                                <p className="text-[11px] text-blue-500/70 font-bold italic leading-relaxed">* Disparo automático do evento Lead.</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center px-2">
                            <h3 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">Questões</h3>
                            <button type="button" onClick={handleAddField} className="flex items-center gap-2 text-xs font-black text-white bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition-all hover:scale-[1.02] uppercase tracking-widest">
                              <Plus className="w-4 h-4" /> Adicionar Pergunta
                            </button>
                          </div>

                          <div className="space-y-6">
                            {formFields.map((field, idx) => (
                              <div key={field.id} className="bg-white dark:bg-gray-900 p-8 rounded-lg border group animate-in zoom-in-95">
                                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                  <div className="flex-shrink-0 text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center">{idx + 1}</div>
                                  <div className="flex-[2] w-full">
                                    <input 
                                      type="text" 
                                      value={field.label} 
                                      onChange={(e) => updateField(field.id, { label: e.target.value })} 
                                      placeholder="Ex: Qual o seu e-mail?" 
                                      className="w-full px-6 py-5 rounded-lg border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 text-gray-900 dark:text-white font-black text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300" 
                                      required 
                                    />
                                  </div>
                                  <div className="flex-1 w-full lg:w-72">
                                    <div className="relative">
                                      <select 
                                        value={field.type} 
                                        onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })} 
                                        className="w-full pl-14 pr-10 py-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-black text-sm appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                                      >
                                        <option value="text">Curta</option>
                                        <option value="long_text">Longa</option>
                                        <option value="email">E-mail</option>
                                        <option value="phone">Whats</option>
                                        <option value="multiple_choice">Escolha</option>
                                        <option value="checkbox">Caixas</option>
                                        <option value="dropdown">Lista</option>
                                        <option value="date">Data</option>
                                        <option value="number">Número</option>
                                      </select>
                                      <div className="absolute left-6 top-5 text-blue-600">
                                        {field.type === 'text' && <Type className="w-5 h-5" />}
                                        {field.type === 'long_text' && <AlignLeft className="w-5 h-5" />}
                                        {field.type === 'email' && <Mail className="w-5 h-5" />}
                                        {field.type === 'phone' && <Phone className="w-5 h-5" />}
                                        {field.type === 'date' && <Calendar className="w-5 h-5" />}
                                        {field.type === 'number' && <Hash className="w-5 h-5" />}
                                        {field.type === 'multiple_choice' && <Radio className="w-5 h-5" />}
                                        {field.type === 'checkbox' && <CheckSquare className="w-5 h-5" />}
                                        {field.type === 'dropdown' && <Layers className="w-5 h-5" />}
                                      </div>
                                      <ChevronDown className="absolute right-6 top-6 w-4 h-4 text-gray-300 pointer-events-none" />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-6 lg:ml-auto">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                      <input 
                                        type="checkbox" 
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        className="w-6 h-6 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                      />
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Obrigatório</span>
                                    </label>
                                    <button 
                                      type="button"
                                      onClick={() => handleRemoveField(field.id)}
                                      className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                      <Trash className="w-6 h-6" />
                                    </button>
                                  </div>
                                </div>

                                {['multiple_choice', 'checkbox', 'dropdown'].includes(field.type) && (
                                  <div className="mt-8 pl-14 lg:pl-20 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                                    {(field.options || []).map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-50 dark:border-gray-800 group/opt transition-all hover:border-blue-100">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"><CircleDot className="w-3.5 h-3.5 text-blue-500" /></div>
                                        <input 
                                          type="text"
                                          value={opt}
                                          onChange={(e) => updateOption(field.id, optIdx, e.target.value)}
                                          className="flex-1 bg-transparent text-sm font-black text-gray-700 dark:text-gray-200 outline-none"
                                        />
                                        <button 
                                          type="button"
                                          onClick={() => removeOption(field.id, optIdx)}
                                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                    <button 
                                      type="button"
                                      onClick={() => handleAddOption(field.id)}
                                      className="flex items-center justify-center gap-2 p-4 text-xs font-black text-blue-600 border-2 border-dashed border-blue-100 dark:border-blue-900/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all uppercase tracking-widest"
                                    >
                                      <Plus className="w-4 h-4" /> Nova Opção
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Preview Column */}
                    <div className="hidden xl:block">
                      <div className="sticky top-0 space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          <Eye className="w-4 h-4" /> Preview do Formulário
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                          {/* Mobile Frame Header */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-100 dark:border-gray-800 flex justify-center">
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          </div>

                          <div className="p-8 flex-1 space-y-8 overflow-y-auto max-h-[500px] scrollbar-hide">
                            <div className="text-center space-y-4">
                              <div className="flex justify-center">
                                {profile?.company_logo_url ? (
                                  <img 
                                    src={profile.company_logo_url} 
                                    alt={profile.company_name || 'Logo'} 
                                    className="h-12 w-auto object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <Logo className="h-8 w-auto" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xl font-black text-gray-900 dark:text-white">{formData.name || 'Título do Formulário'}</h4>
                                <p className="text-xs text-gray-400 font-medium">Preencha os dados abaixo para continuar</p>
                              </div>
                            </div>

                            {!isFormEnabled ? (
                              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-200">
                                  <X className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Formulário Desativado</p>
                              </div>
                            ) : formFields.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-200">
                                  <Plus className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Adicione campos para visualizar</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {formFields.length > 0 && (
                                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" key={currentPreviewStep}>
                                    <div className="space-y-2.5">
                                      <label className="block text-xs font-black text-gray-700 dark:text-gray-300">
                                        {formFields[currentPreviewStep]?.label || 'Pergunta sem título'}
                                        {formFields[currentPreviewStep]?.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                      {renderFieldPreviewInput(formFields[currentPreviewStep])}
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                      {currentPreviewStep > 0 && (
                                        <button 
                                          type="button"
                                          onClick={() => setCurrentPreviewStep(prev => prev - 1)}
                                          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:bg-gray-200"
                                        >
                                          Voltar
                                        </button>
                                      )}
                                      
                                      {currentPreviewStep < formFields.length - 1 ? (
                                        <button 
                                          type="button"
                                          onClick={() => setCurrentPreviewStep(prev => prev + 1)}
                                          className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all hover:bg-blue-700"
                                        >
                                          Próximo
                                        </button>
                                      ) : (
                                        <button 
                                          type="button"
                                          className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all hover:bg-blue-700"
                                        >
                                          {submitButtonText}
                                        </button>
                                      )}
                                    </div>

                                    {/* Step Indicator */}
                                    <div className="flex justify-center gap-2 pt-4">
                                      {formFields.map((_, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`h-1.5 rounded-full transition-all ${idx === currentPreviewStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-800'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 text-center">
                            <p className="text-[8px] text-gray-300 dark:text-gray-600 font-black uppercase tracking-[0.3em]">Ambiente de Demonstração</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'qualification' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right-4">
                     <div className="space-y-8">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Quantidade de Vendas (Manual)</label>
                           <input 
                              type="number" 
                              name="salesCount" 
                              value={formData.salesCount} 
                              onChange={handleInputChange} 
                              className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Qualificação de Leads</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['FRIO', 'MORNO', 'QUENTE'].map(q => (
                                 <button 
                                    key={q}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, leadQualification: q as any }))}
                                    className={`py-4 rounded-xl font-black text-xs transition-all border-2 ${
                                       formData.leadQualification === q 
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                                          : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-blue-200'
                                    }`}
                                 >
                                    {q}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-center justify-center text-center space-y-4">
                        <Target className="w-12 h-12 text-blue-600 mb-2" />
                        <h4 className="text-lg font-black text-blue-900 dark:text-blue-100">Inteligência de Tráfego</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">A qualificação manual ajuda o algoritmo a entender quais criativos estão trazendo leads de maior qualidade para o seu negócio.</p>
                     </div>
                  </div>
                )}
              </form>
              <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-5"><button type="button" onClick={() => setIsFormVisible(false)} className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 transition-colors">Descartar</button><button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-black uppercase tracking-[0.1em] flex items-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}{editingId ? 'Salvar' : 'Criar'}</button></div>
           </div>
        </div>,
        document.body
      )}

      {isDetailsModalOpen && (
        <CampaignModal 
          campaign={selectedCampaign} 
          isOpen={isDetailsModalOpen} 
          onClose={() => setIsDetailsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default LinksPage;
