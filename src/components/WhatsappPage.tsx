
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageCircle, Plus, Copy, Trash2, Edit, Eye, 
  Settings, X, Loader2, Save, Upload, CheckCircle2, Phone as PhoneIcon, Target,
  ClipboardList, ListPlus, Link as LinkIcon, ChevronDown, CircleDot, Trash,
  Type, AlignLeft, Mail, Phone, Calendar, Hash, CheckSquare, Layers, Radio
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campaign, WhatsappContact, FormField, FieldType, UserProfile } from '../types';
import CampaignModal from './CampaignModal';
import { Logo } from './Logo';

const WhatsappPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [phones, setPhones] = useState<WhatsappContact[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'utm' | 'form' | 'qualification'>('basic');
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phoneId: '',
    message: '',
    source: '',
    campaign: '',
    medium: 'chat',
    content: '',
    salesCount: 0,
    leadQualification: 'FRIO' as const
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState({ alias: '', number: '' });

  // Form Builder State
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [pixelId, setPixelId] = useState('');
  const [submitButtonText, setSubmitButtonText] = useState('Enviar para o WhatsApp');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileData) setProfile(profileData);

      if (!isSupabaseConfigured) {
        setPhones([
          { id: '1', name: 'Atendimento Principal', phone_number: '5511999999999', user_id: 'demo', created_at: '' },
          { id: '2', name: 'Suporte VIP', phone_number: '5511888888888', user_id: 'demo', created_at: '' },
          { id: '3', name: 'Comercial SP', phone_number: '5511777777777', user_id: 'demo', created_at: '' }
        ]);

        setCampaigns([
          {
            id: 'wa-1',
            name: 'Atendimento Site',
            originalUrl: 'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20vim%20pelo%20site!',
            shortUrl: 'ltrk.io/wa-site',
            clicks: 1250,
            imageUrl: 'https://picsum.photos/200/200?random=101',
            createdAt: new Date().toISOString(),
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/5511999999999',
            utm: { source: 'site', medium: 'chat', campaign: 'institucional', content: 'botao_flutuante' },
            creativeName: 'Botão Flutuante',
            adSetName: 'Orgânico',
            status: 'active'
          },
          {
            id: 'wa-2',
            name: 'Promoção Relâmpago',
            originalUrl: 'https://wa.me/5511888888888?text=Quero%20a%20promo%C3%A7%C3%A3o!',
            shortUrl: 'ltrk.io/wa-promo',
            clicks: 3420,
            imageUrl: 'https://picsum.photos/200/200?random=102',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/5511888888888',
            utm: { source: 'instagram', medium: 'chat', campaign: 'promo_relampago', content: 'stories_video' },
            creativeName: 'Stories Vídeo',
            adSetName: 'Seguidores',
            status: 'active',
            formConfig: {
               id: 'form-1',
               title: 'Promoção Relâmpago',
               submitButtonText: 'Liberar Cupom',
               fields: [
                  { id: 'f1', label: 'Nome', type: 'text', required: true },
                  { id: 'f2', label: 'E-mail', type: 'email', required: true }
               ],
               pixelId: '123456789'
            }
          },
          {
            id: 'wa-3',
            name: 'Suporte Técnico',
            originalUrl: 'https://wa.me/5511999999999?text=Preciso%20de%20ajuda.',
            shortUrl: 'ltrk.io/wa-help',
            clicks: 540,
            imageUrl: 'https://picsum.photos/200/200?random=103',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/5511999999999',
            utm: { source: 'email', medium: 'chat', campaign: 'pos_venda', content: 'link_rodape' },
            creativeName: 'Link Rodapé',
            adSetName: 'Clientes',
            status: 'active'
          }
        ]);

        setLoading(false);
        return;
      }

      const { data: contactsData } = await supabase.from('whatsapp_contacts').select('*').eq('user_id', session.user.id);
      if (contactsData) setPhones(contactsData as WhatsappContact[]);

      const { data: campaignData, error } = await supabase.from('campaigns').select('*').eq('user_id', session.user.id).eq('utm_medium', 'chat').order('created_at', { ascending: false });
      if (error) throw error;

      setCampaigns((campaignData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        originalUrl: item.original_url,
        shortUrl: `ltrk.io/${item.short_code}`,
        clicks: item.clicks_count || 0,
        imageUrl: item.creative_url || 'https://picsum.photos/200/200?grayscale',
        createdAt: item.created_at,
        qrCodeUrl: item.qr_code,
        utm: { source: item.utm_source || '', medium: item.utm_medium || '', campaign: item.utm_campaign || '', content: item.utm_content || '' },
        creativeName: item.utm_content || 'WhatsApp',
        adSetName: 'WhatsApp',
        status: item.is_active ? 'active' : 'inactive',
        formConfig: item.form_config
      })));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveField = (id: string) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleAddOption = (fieldId: string) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        const currentOptions = f.options || [];
        return { ...f, options: [...currentOptions, `Opção ${currentOptions.length + 1}`] };
      }
      return f;
    }));
  };

  const updateOption = (fieldId: string, optionIndex: number, newValue: string) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId && f.options) {
        const newOptions = [...f.options];
        newOptions[optionIndex] = newValue;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId && f.options) {
        return { ...f, options: f.options.filter((_, idx) => idx !== optionIndex) };
      }
      return f;
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.alias || !newPhone.number) return;
    
    if (!isSupabaseConfigured) {
        setPhones([...phones, { id: Math.random().toString(), name: newPhone.alias, phone_number: newPhone.number, user_id: 'demo', created_at: '' }]);
        setNewPhone({ alias: '', number: '' });
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
        const { data, error } = await supabase.from('whatsapp_contacts').insert([{ user_id: session.user.id, name: newPhone.alias, phone_number: newPhone.number.replace(/\D/g, '') }]).select().single();
        if (error) throw error;
        setPhones([...phones, data as WhatsappContact]);
        setNewPhone({ alias: '', number: '' });
    } catch (err) { alert("Erro ao cadastrar número."); }
  };

  const handleDeletePhone = async (id: string) => {
    if (!isSupabaseConfigured) {
        setPhones(phones.filter(p => p.id !== id));
        return;
    }
    await supabase.from('whatsapp_contacts').delete().eq('id', id);
    setPhones(phones.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneId: '',
      message: '',
      source: '',
      campaign: '',
      medium: 'chat',
      content: '',
      salesCount: 0,
      leadQualification: 'FRIO'
    });
    setImagePreview(null);
    setEditingId(null);
    setIsFormVisible(false);
    setIsFormEnabled(false);
    setFormFields([]);
    setPixelId('');
    setSubmitButtonText('Enviar para o WhatsApp');
    setCurrentPreviewStep(0);
    setActiveTab('basic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingId && !formData.phoneId) return alert("Selecione um número de destino.");

    if (!isSupabaseConfigured) {
        alert("Modo Demo: Alterações não são salvas.");
        resetForm();
        return;
    }

    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    let waUrl: string;
    if (!editingId) {
      const selectedPhone = phones.find(p => p.id === formData.phoneId);
      const trackingInfo = `\n\n(Origem: ${formData.source} | Conjunto: ${formData.medium} | Campanha: ${formData.campaign})`;
      const finalMessage = `${formData.message}${trackingInfo}`;
      waUrl = `https://wa.me/${selectedPhone?.phone_number}?text=${encodeURIComponent(finalMessage)}`;
    } else {
        const currentCampaign = campaigns.find(c => c.id === editingId);
        if (formData.phoneId) {
            const selectedPhone = phones.find(p => p.id === formData.phoneId);
            const trackingInfo = `\n\n(Origem: ${formData.source} | Conjunto: ${formData.medium} | Campanha: ${formData.campaign})`;
            const finalMessage = `${formData.message}${trackingInfo}`;
            waUrl = `https://wa.me/${selectedPhone?.phone_number}?text=${encodeURIComponent(finalMessage)}`;
        } else {
            waUrl = currentCampaign?.originalUrl || '';
        }
    }
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(waUrl)}`;

    const dbPayload = {
        name: formData.name,
        original_url: waUrl,
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
          fields: formFields, 
          submitButtonText: submitButtonText,
          pixelId: pixelId 
        } : null
    };

    try {
        if (editingId) {
            await supabase.from('campaigns').update(dbPayload).eq('id', editingId);
        } else {
            const shortCode = Math.random().toString(36).substr(2, 6);
            await supabase.from('campaigns').insert([{ ...dbPayload, short_code: shortCode, clicks_count: 0, is_active: true }]);
        }
        await fetchData();
        resetForm();
    } catch (err) { alert("Erro ao salvar link."); } finally { setIsSubmitting(false); }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    const decodedMsg = campaign.originalUrl.includes('text=') ? decodeURIComponent(campaign.originalUrl.split('text=')[1]).split('\n\n(')[0] : '';
    
    setFormData({
      name: campaign.name,
      phoneId: '', 
      message: decodedMsg,
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
      setSubmitButtonText(campaign.formConfig.submitButtonText || 'Enviar para o WhatsApp');
    }
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta campanha?")) return;
    if (!isSupabaseConfigured) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        return;
    }
    await supabase.from('campaigns').delete().eq('id', id);
    fetchData();
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFormFields(newFields);
  };

  const renderFieldPreviewInput = (field: FormField) => {
    const baseClass = "w-full px-5 py-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 text-gray-400 text-sm outline-none cursor-not-allowed font-medium";
    
    switch (field.type) {
      case 'text':
        return <input type="text" placeholder="Resposta curta..." className={baseClass} disabled />;
      case 'long_text':
        return <textarea placeholder="Resposta longa..." className={baseClass} rows={1} disabled />;
      case 'email':
        return <div className="relative"><Mail className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="email" placeholder="email@exemplo.com" className={`${baseClass} pl-12`} disabled /></div>;
      case 'phone':
        return <div className="relative"><Phone className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="text" placeholder="(00) 00000-0000" className={`${baseClass} pl-12`} disabled /></div>;
      case 'date':
        return <div className="relative"><Calendar className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="date" className={`${baseClass} pl-12`} disabled /></div>;
      case 'number':
        return <div className="relative"><Hash className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><input type="number" placeholder="0" className={`${baseClass} pl-12`} disabled /></div>;
      case 'multiple_choice':
        return <div className="flex gap-4 px-2">{(field.options || ['Opção 1', 'Opção 2']).slice(0, 2).map((o, i) => <div key={i} className="flex items-center gap-2 text-xs text-gray-400 font-bold"><Radio className="w-4 h-4" /> {o}</div>)}</div>;
      case 'checkbox':
        return <div className="flex gap-4 px-2">{(field.options || ['Opção A', 'Opção B']).slice(0, 2).map((o, i) => <div key={i} className="flex items-center gap-2 text-xs text-gray-400 font-bold"><CheckSquare className="w-4 h-4" /> {o}</div>)}</div>;
      case 'dropdown':
        return <div className="relative"><Layers className="absolute left-4 top-4 w-4 h-4 text-gray-300" /><div className={`${baseClass} pl-12 flex justify-between items-center`}>Selecionar... <ChevronDown className="w-4 h-4" /></div></div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            WhatsApp Tracking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie links diretos e rastreáveis para WhatsApp com captura de leads.</p>
        </div>
        
        <div className="flex gap-2">
            <button 
              onClick={() => setIsPhoneModalOpen(true)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors font-medium"
            >
              <Settings className="w-4 h-4" /> Configurar Números
            </button>
            <button 
              onClick={() => { resetForm(); setIsFormVisible(true); }}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 font-bold"
            >
              <Plus className="w-5 h-5" /> Gerar Link WA
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-green-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaigns.map((campaign) => (
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
                        <div className="text-center bg-green-50 dark:bg-green-900/10 rounded-lg p-2 border border-green-100 dark:border-green-800/50">
                            <span className="text-[9px] text-green-600 dark:text-green-400 uppercase font-black block mb-1">Clicks</span>
                            <span className="text-xl font-black text-green-700 dark:text-green-300">{campaign.clicks.toLocaleString()}</span>
                        </div>
                        <div className="text-center bg-green-50 dark:bg-green-900/10 rounded-lg p-2 border border-green-100 dark:border-green-800/50">
                            <span className="text-[9px] text-green-600 dark:text-green-400 uppercase font-black block mb-1">Vendas</span>
                            <span className="text-xl font-black text-green-700 dark:text-green-300">{campaign.salesCount || 0}</span>
                        </div>
                        <div className="text-center bg-green-50 dark:bg-green-900/10 rounded-lg p-2 border border-green-100 dark:border-green-800/50 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-green-600 dark:text-green-400 uppercase font-black block mb-1">Lead</span>
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
                            <button onClick={() => handleEdit(campaign)} className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-green-600 hover:text-white transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(campaign.id)} className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                            <button 
                                onClick={() => handleCopy(campaign.shortUrl, campaign.id)}
                                className={`p-2.5 rounded-lg transition-all ${copiedId === campaign.id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-600 hover:text-white'}`}
                                title="Copiar Link"
                            >
                                {copiedId === campaign.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={() => { setSelectedCampaign(campaign); setIsDetailsModalOpen(true); }} className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"><Eye className="w-4 h-4" /> Detalhes</button>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}

      {isFormVisible && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="absolute inset-0" onClick={() => !isSubmitting && resetForm()}></div>
           <div className="relative bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 dark:border-zinc-900 animate-in zoom-in-95">
              
              <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-zinc-900">
                <div className="flex justify-between items-center p-8 pb-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-green-500" />
                      {editingId ? 'Editar Link WhatsApp' : 'Gerar Novo Link WhatsApp'}
                  </h2>
                  <button onClick={() => resetForm()} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                      <X className="w-7 h-7 text-gray-400" />
                  </button>
                </div>
                
                <div className="px-8 flex gap-8">
                  {[
                    { id: 'basic', label: 'Básico', icon: LinkIcon },
                    { id: 'utm', label: 'UTMs', icon: ListPlus },
                    { id: 'form', label: 'Formulário', icon: ClipboardList },
                    { id: 'qualification', label: 'Qualificação', icon: CheckCircle2 },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-4 text-sm font-black border-b-[3px] transition-all uppercase tracking-wider ${
                        activeTab === tab.id 
                          ? 'border-green-600 text-green-600' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 bg-gray-50/50 dark:bg-black/40">
                
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Nome da Campanha</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Lançamento VIP" className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-black text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Telefone de Destino</label>
                            <div className="relative">
                              <select 
                                name="phoneId" 
                                value={formData.phoneId} 
                                onChange={handleInputChange} 
                                className="w-full pl-5 pr-10 py-4 rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-black text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer shadow-sm"
                                required={!editingId}
                              >
                                  <option value="">{editingId ? 'Manter número atual' : 'Selecione o número...'}</option>
                                  {phones.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone_number})</option>)}
                              </select>
                              <ChevronDown className="absolute right-5 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Mensagem Inicial</label>
                            <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Olá! Quero mais informações..." rows={4} className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-black text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Imagem do Criativo</label>
                        <label className="flex flex-col items-center justify-center w-full h-60 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 bg-white dark:bg-gray-800 transition-all cursor-pointer overflow-hidden shadow-sm">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-300">
                                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-black uppercase tracking-widest">Upload da Thumb</p>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                  </div>
                )}

                {activeTab === 'utm' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
                    {[
                      { name: 'source', label: 'Origem (Source)', placeholder: 'facebook, google, email' },
                      { name: 'medium', label: 'Conjunto (Medium)', placeholder: 'cpc, stories, feed' },
                      { name: 'campaign', label: 'Campanha (Campaign)', placeholder: 'venda_quente_01' },
                      { name: 'content', label: 'Criativo (Content)', placeholder: 'video_vsl_01' },
                    ].map(field => (
                      <div key={field.name}>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">{field.label}</label>
                        <input type="text" name={field.name} value={(formData as any)[field.name]} onChange={handleInputChange} placeholder={field.placeholder} className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 transition-all shadow-sm" required />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'form' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in slide-in-from-left-4">
                    <div className="xl:col-span-2 space-y-8">
                      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${isFormEnabled ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-400'}`}>
                            <ClipboardList className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 dark:text-white text-lg">Ativar Formulário de Captura</p>
                            <p className="text-sm text-gray-500 font-medium">Capture os dados do lead antes dele entrar no WhatsApp</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsFormEnabled(!isFormEnabled)}
                          className={`w-16 h-8 rounded-full transition-all relative ${isFormEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isFormEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                      {isFormEnabled && (
                        <div className="space-y-8">
                          {/* Facebook Pixel Section */}
                          <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-lg border border-blue-100 dark:border-blue-800/50 space-y-5">
                             <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400 mb-2">
                               <Target className="w-6 h-6" />
                               <h4 className="font-black text-[11px] uppercase tracking-[0.2em]">Facebook Pixel Tracking</h4>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                               <div className="space-y-2.5">
                                  <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">ID do Pixel (Apenas números)</label>
                                  <input 
                                    type="text" 
                                    value={pixelId}
                                    onChange={(e) => setPixelId(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Ex: 123456789012345"
                                    className="w-full px-5 py-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-blue-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold shadow-sm"
                                  />
                               </div>
                               <div className="pb-2">
                                 <p className="text-[11px] text-blue-500/70 font-bold italic leading-relaxed">
                                   * O evento de 'Lead' será disparado para o Facebook contendo os dados do formulário antes do redirecionamento para o WhatsApp.
                                 </p>
                               </div>
                             </div>
                          </div>

                          {/* Submit Button Customization */}
                          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Texto do Botão de Envio</label>
                            <input 
                              type="text" 
                              value={submitButtonText}
                              onChange={(e) => setSubmitButtonText(e.target.value)}
                              placeholder="Ex: Enviar para o WhatsApp"
                              className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm"
                            />
                          </div>

                          <div className="flex justify-between items-center px-2">
                            <h3 className="text-[11px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.3em]">Configuração das Questões</h3>
                            <button 
                              type="button"
                              onClick={handleAddField}
                              className="flex items-center gap-2 text-xs font-black text-white bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700 transition-all hover:scale-[1.02] uppercase tracking-widest"
                            >
                              <Plus className="w-4 h-4" /> Adicionar Pergunta
                            </button>
                          </div>

                          <div className="space-y-6">
                            {formFields.length === 0 && (
                              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800">
                                  <ClipboardList className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nenhum campo configurado</p>
                              </div>
                            )}
                            {formFields.map((field, idx) => (
                              <div key={field.id} className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md animate-in zoom-in-95 group">
                                
                                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                  {/* Question Index & Move Controls */}
                                  <div className="flex flex-col items-center gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => moveField(idx, 'up')}
                                      disabled={idx === 0}
                                      className="p-1 text-gray-300 hover:text-green-600 disabled:opacity-0 transition-all"
                                    >
                                      <ChevronDown className="w-5 h-5 rotate-180" />
                                    </button>
                                    <div className="flex-shrink-0 text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center shadow-inner">
                                      {idx + 1}
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => moveField(idx, 'down')}
                                      disabled={idx === formFields.length - 1}
                                      className="p-1 text-gray-300 hover:text-green-600 disabled:opacity-0 transition-all"
                                    >
                                      <ChevronDown className="w-5 h-5" />
                                    </button>
                                  </div>
                                  
                                  {/* Question Text Input */}
                                  <div className="flex-[2] w-full">
                                    <input 
                                      type="text" 
                                      value={field.label}
                                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                                      placeholder="Ex: Qual o seu melhor e-mail?"
                                      className="w-full px-6 py-5 rounded-lg border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 text-gray-900 dark:text-white font-black text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                                      required
                                    />
                                  </div>

                                  {/* Type Selector */}
                                  <div className="flex-1 w-full lg:w-72">
                                    <div className="relative">
                                      <select 
                                        value={field.type}
                                        onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                                        className="w-full pl-14 pr-10 py-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-black text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
                                      >
                                        <option value="text">Resposta Curta</option>
                                        <option value="long_text">Parágrafo</option>
                                        <option value="email">E-mail</option>
                                        <option value="phone">WhatsApp / Telefone</option>
                                        <option value="multiple_choice">Múltipla Escolha</option>
                                        <option value="checkbox">Caixas de Seleção</option>
                                        <option value="dropdown">Lista Suspensa</option>
                                        <option value="date">Data</option>
                                        <option value="number">Número</option>
                                      </select>
                                      <div className="absolute left-6 top-5 text-green-600">
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

                                  {/* Row Actions */}
                                  <div className="flex items-center gap-6 lg:ml-auto">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                      <input 
                                        type="checkbox" 
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        className="w-6 h-6 rounded-lg border-gray-200 text-green-600 focus:ring-green-500 transition-all cursor-pointer"
                                      />
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors">Obrigatório</span>
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

                                {/* Nested Options for List types */}
                                {['multiple_choice', 'checkbox', 'dropdown'].includes(field.type) && (
                                  <div className="mt-8 pl-14 lg:pl-20 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                                    {(field.options || []).map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-50 dark:border-gray-800 group/opt transition-all hover:border-green-100">
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md"><CircleDot className="w-3.5 h-3.5 text-green-500" /></div>
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
                                      className="flex items-center justify-center gap-2 p-4 text-xs font-black text-green-600 border-2 border-dashed border-green-100 dark:border-green-900/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 transition-all uppercase tracking-widest"
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
                                          className="flex-[2] bg-green-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none transition-all hover:bg-green-700"
                                        >
                                          Próximo
                                        </button>
                                      ) : (
                                        <button 
                                          type="button"
                                          className="flex-[2] bg-green-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none transition-all hover:bg-green-700"
                                        >
                                          {submitButtonText}
                                        </button>
                                      )}
                                    </div>

                                    {/* Step Indicator */}
                                    <div className="flex justify-center gap-1.5 pt-4">
                                      {formFields.map((_, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`h-1 rounded-full transition-all ${idx === currentPreviewStep ? 'w-6 bg-green-600' : 'w-2 bg-gray-200 dark:bg-gray-800'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Mobile Frame Footer */}
                          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Powered by LeadTracker</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'qualification' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-left-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Quantidade de vendas</label>
                      <input 
                        type="number" 
                        name="salesCount" 
                        value={formData.salesCount} 
                        onChange={handleInputChange} 
                        className="w-full px-5 py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Qualificação dos leads</label>
                      <div className="flex gap-2">
                        {(['FRIO', 'MORNO', 'QUENTE'] as const).map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, leadQualification: q }))}
                            className={`flex-1 py-4 rounded-lg font-black text-xs transition-all border ${
                              formData.leadQualification === q
                                ? q === 'QUENTE' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' :
                                  q === 'MORNO' ? 'bg-yellow-500 border-yellow-500 text-white shadow-lg shadow-yellow-100' :
                                  'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>

              <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-5">
                  <button type="button" onClick={() => resetForm()} className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors">Descartar</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-lg font-black uppercase tracking-[0.1em] flex items-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {editingId ? 'Salvar Alterações' : 'Gerar Link WA'}
                  </button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Phone Settings Modal */}
      {isPhoneModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="relative bg-[#F9FAFB] dark:bg-gray-900 rounded-[32px] shadow-2xl w-full max-w-md p-10 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-bold text-xl flex items-center gap-3 text-gray-700 dark:text-white tracking-tight">
                      <MessageCircle className="w-6 h-6 text-green-500" /> DESTINOS WA
                    </h3>
                    <button onClick={() => setIsPhoneModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-gray-400">
                      <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleAddPhone} className="space-y-4 mb-12 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={newPhone.alias} 
                        onChange={(e) => setNewPhone(prev => ({...prev, alias: e.target.value}))} 
                        placeholder="Comercial" 
                        className="w-full px-5 py-4 border-2 border-blue-600 dark:border-blue-500 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-0 outline-none transition-all" 
                        required 
                      />
                      
                      <div className="flex gap-0 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2 px-4 py-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                          <img src="https://flagcdn.com/w40/br.png" alt="BR" className="w-6 h-4 object-cover rounded-sm" />
                          <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">+55</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          value={newPhone.number} 
                          onChange={(e) => setNewPhone(prev => ({...prev, number: e.target.value}))} 
                          placeholder="(99) 99999-9999" 
                          className="flex-1 px-5 py-4 bg-transparent text-gray-900 dark:text-white font-medium outline-none" 
                          required 
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#16A34A] hover:bg-green-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-100 dark:shadow-none">
                      ADICIONAR NÚMERO
                    </button>
                </form>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 px-1">NÚMEROS SALVOS</p>
                    {phones.length === 0 && <p className="text-center py-10 text-gray-300 font-bold uppercase tracking-widest text-xs italic">Vazio</p>}
                    {phones.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:border-blue-100">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200 text-lg leading-tight">{p.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{p.phone_number}</p>
                            </div>
                            <button 
                              onClick={() => handleDeletePhone(p.id)} 
                              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-gray-100 dark:border-gray-700 transition-all"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
      )}

      <CampaignModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} campaign={selectedCampaign} />
    </div>
  );
};

export default WhatsappPage;
