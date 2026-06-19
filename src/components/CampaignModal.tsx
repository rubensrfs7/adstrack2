
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, Copy, ClipboardList, Users, Target, Tag, Image as ImageIcon, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { Campaign, FormResponse } from '../types';

interface CampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ campaign, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'leads'>('details');
  const [mockLeads, setMockLeads] = useState<FormResponse[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) {
      // Simulação de leads enriquecidos com UTMs e contexto de criativo
      const timer = setTimeout(() => {
        setMockLeads([
          {
            id: '1',
            campaign_id: campaign.id,
            data: { 'Nome': 'Ricardo Santos', 'Email': 'ricardo@exemplo.com', 'WhatsApp': '11988887777', 'Estado': 'São Paulo' },
            utm_context: campaign.utm,
            creative_context: { name: campaign.creativeName, image_url: campaign.imageUrl },
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            campaign_id: campaign.id,
            data: { 'Nome': 'Mariana Oliveira', 'Email': 'mariana.m@gmail.com', 'WhatsApp': '11966665555', 'Estado': 'Rio de Janeiro' },
            utm_context: campaign.utm,
            creative_context: { name: campaign.creativeName, image_url: campaign.imageUrl },
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [campaign]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen || !campaign) return null;

  const renderDetails = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Coluna Esquerda: Visual do Criativo + Links */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">VISUAL DO CRIATIVO</label>
          <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 aspect-video bg-gray-50">
            <img src={campaign.imageUrl} alt={campaign.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Link de Acesso</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#F9FAFB] dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 truncate">
                {campaign.shortUrl}
              </div>
              <button 
                onClick={() => handleCopy(campaign.shortUrl, 'short')}
                className={`p-3.5 rounded-xl border transition-all ${copiedId === 'short' ? 'bg-green-500 text-white border-green-500' : 'bg-[#F9FAFB] dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100'}`}
              >
                {copiedId === 'short' ? <CheckCircle2 className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Destino Final</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#F9FAFB] dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 truncate">
                {campaign.originalUrl}
              </div>
              <button 
                onClick={() => handleCopy(campaign.originalUrl, 'original')}
                className={`p-3.5 rounded-xl border transition-all ${copiedId === 'original' ? 'bg-green-500 text-white border-green-500' : 'bg-[#F9FAFB] dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-100'}`}
              >
                {copiedId === 'original' ? <CheckCircle2 className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Stats e Tracking */}
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-blue-100 dark:shadow-none flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">CLICKS</span>
            <p className="text-4xl font-black mt-1">{campaign.clicks.toLocaleString()}</p>
          </div>
          <div className="bg-green-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-green-100 dark:shadow-none flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">VENDAS</span>
            <p className="text-4xl font-black mt-1">{campaign.salesCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">QUALIFICAÇÃO</span>
            <span className={`mt-2 text-sm font-black px-4 py-1.5 rounded-full uppercase ${
              campaign.leadQualification === 'QUENTE' ? 'bg-orange-500 text-white' :
              campaign.leadQualification === 'MORNO' ? 'bg-yellow-500 text-white' :
              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {campaign.leadQualification || 'FRIO'}
            </span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">STATUS</span>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2 uppercase tracking-tight">
            {campaign.status === 'active' ? 'Aprendizado' : 'Pausado'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">TRACKING (UTMS)</h3>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Source</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 block tracking-tight">{campaign.utm.source || '---'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Medium</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 block tracking-tight">{campaign.utm.medium || '---'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Campaign</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 block tracking-tight leading-tight">{campaign.utm.campaign || '---'}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Content</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100 block tracking-tight">{campaign.utm.content || '---'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" /> 
          Dossiê de Leads Capturados
        </h3>
        <button className="flex items-center gap-2 text-xs font-black text-blue-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all shadow-sm uppercase tracking-widest">
          <Download className="w-4 h-4" /> Exportar Dados
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {mockLeads.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">Aguardando capturas...</p>
          </div>
        ) : (
          mockLeads.map((lead, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 dark:bg-gray-800/20 gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 dark:shadow-none">
                    {Object.values(lead.data)[0].toString().charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-lg leading-tight">
                      {Object.values(lead.data)[0].toString()}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Capturado em: {new Date(lead.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-full font-black uppercase tracking-wider border border-green-200 dark:border-green-800">PIXEL DISPARADO</span>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ClipboardList className="w-4 h-4" /> Dados Coletados
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(lead.data).map(([key, val]) => (
                      <div key={key}>
                        <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-0.5">{key}</span>
                        <span className="text-sm font-black text-gray-800 dark:text-gray-200 break-words">{val.toString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Tag className="w-4 h-4" /> Origem (UTMs)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(lead.utm_context).map(([key, val]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                         <span className="block text-[8px] text-gray-400 font-black uppercase mb-0.5">{key}</span>
                         <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 truncate block">{val || '---'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ImageIcon className="w-4 h-4" /> Criativo
                  </h4>
                  <div className="relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 aspect-video shadow-sm">
                     <img src={lead.creative_context.image_url} alt="" className="w-full h-full object-cover" />
                     <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-3">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider truncate block">{lead.creative_context.name}</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col transition-all">
        
        {/* Header Section */}
        <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-700 dark:text-white uppercase tracking-tight">{campaign.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl w-full">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'details' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Informações da Campanha
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'leads' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Leads Capturados
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F9FAFB] dark:bg-black/20">
          {activeTab === 'details' ? renderDetails() : renderLeads()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CampaignModal;
