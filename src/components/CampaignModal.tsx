
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  LineChart,
  Line,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
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
  
  // Filter states
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [adSetFilter, setAdSetFilter] = useState<string>('all');
  const [creativeFilter, setCreativeFilter] = useState<string>('all');

  // Gera dados semanais fictícios e consistentes para comparar com a semana passada no gráfico
  const chartData = React.useMemo(() => {
    if (!campaign) return [];
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const clicksValue = campaign.clicks || 0;
    const baseValue = Math.max(2, Math.round(clicksValue / 14)); // média diária nas duas semanas

    const healthScore = campaign.healthScore || campaign.score || 50;

    return days.map((day, index) => {
      const pseudoRandomThis = (campaign.id.charCodeAt(0) + index) % 4;
      const pseudoRandomLast = (campaign.id.charCodeAt(0) + index * 2) % 5;
      const modifierThis = healthScore > 65 ? 1.25 : 0.85;
      const modifierLast = 1.0;

      const valueThis = Math.round(baseValue * (0.8 + pseudoRandomThis * 0.12) * modifierThis) || 1;
      const valueLast = Math.round(baseValue * (0.85 + pseudoRandomLast * 0.1) * modifierLast) || 1;

      return {
        name: day,
        "Esta Semana": valueThis,
        "Semana Passada": valueLast,
      };
    });
  }, [campaign]);

  // Calcula estatísticas detalhadas de vendas, leads e conversão de forma realista
  const cardStats = React.useMemo(() => {
    if (!campaign) return { leadsCount: 0, vendas: 0, conversionRate: "0.0%" };
    
    // Calcula leads de forma consistente e proporcional (ex: ~12% dos cliques)
    const clicksValue = campaign.clicks || 0;
    const leadsCount = Math.round(clicksValue * 0.12) || (campaign.salesCount ? campaign.salesCount * 3 : 0) || Math.round(clicksValue * 0.08) || 1;
    
    // Vendas reais da campanha
    const vendas = campaign.salesCount || 0;
    
    // Taxa de Conversão de Leads para Vendas
    const conversionRate = leadsCount > 0 
      ? ((vendas / leadsCount) * 100).toFixed(1) + "%" 
      : "0.0%";

    return {
      leadsCount,
      vendas,
      conversionRate
    };
  }, [campaign]);

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

  const downloadQrCode = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename.replace(/\s+/g, '_')}_qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao baixar QR Code via fetch:', error);
      // Fallback usando Image e Canvas para evitar problemas de CORS
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${filename.replace(/\s+/g, '_')}_qrcode.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (canvasErr) {
            console.error("Erro CORS Canvas:", canvasErr);
            window.open(url, "_blank");
          }
        }
      };
      img.src = url;
    }
  };

  if (!isOpen || !campaign) return null;

  const renderDetails = () => {
    const healthScore = campaign.healthScore || campaign.score || 50;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Prominent Creative banner */}
          <div className="md:col-span-5 flex flex-col h-full space-y-4">
            <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-150 dark:border-zinc-900/50 h-full">
              <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Criativo em Destaque
              </h4>
              <div className="relative mt-2 mx-2 mb-8 w-[calc(100%-1rem)] h-[calc(100%-2.5rem)] rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-md bg-gray-100 dark:bg-zinc-900 group">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.creativeName || "Criativo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12">
                  <span className="text-[8px] font-black tracking-widest text-blue-400 uppercase">
                    Criativo / Imagem
                  </span>
                  <p className="text-white font-bold text-sm leading-tight truncate">
                    {campaign.creativeName || "Criativo Principal"}
                  </p>
                  <p className="text-gray-300 text-[10px] truncate mt-0.5">
                    Conjunto: {campaign.adSetName || "Geral"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Statistics & UTMs */}
          <div className="md:col-span-7 space-y-5">
            {/* Metrics Grid & Mini Weekly comparison chart */}
            <div>
              <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">
                Métricas de Desempenho & Comparativo Semanal
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Metrics Grid */}
                <div className="lg:col-span-7 grid grid-cols-2 gap-2">
                  <div className="bg-blue-50/70 dark:bg-blue-900/10 p-2.5 rounded-xl border border-blue-100/50 dark:border-blue-500/10 text-center flex flex-col justify-between">
                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Cliques
                    </p>
                    <p className="text-base font-black text-blue-700 dark:text-blue-400 mt-1">
                      {campaign.clicks}
                    </p>
                  </div>
                  <div className="bg-emerald-50/70 dark:bg-emerald-900/10 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10 text-center flex flex-col justify-between">
                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      CTR
                    </p>
                    <p className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      {campaign.ctr || "2.8"}%
                    </p>
                  </div>
                  <div className="bg-purple-50/70 dark:bg-purple-900/10 p-2.5 rounded-xl border border-purple-100/50 dark:border-purple-500/10 text-center flex flex-col justify-between">
                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Leads
                    </p>
                    <p className="text-base font-black text-purple-700 dark:text-purple-400 mt-1">
                      {cardStats.leadsCount}
                    </p>
                  </div>
                  <div className="bg-pink-50/70 dark:bg-pink-900/10 p-2.5 rounded-xl border border-pink-100/50 dark:border-pink-500/10 text-center flex flex-col justify-between">
                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Vendas
                    </p>
                    <p className="text-base font-black text-pink-700 dark:text-pink-400 mt-1">
                      {cardStats.vendas}
                    </p>
                  </div>
                  <div className="col-span-2 bg-amber-50/60 dark:bg-amber-900/10 p-2.5 rounded-xl border border-amber-100/50 dark:border-amber-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Taxa de Conversão
                      </p>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        Leads para Vendas
                      </span>
                    </div>
                    <p className="text-base font-black text-amber-700 dark:text-amber-400">
                      {cardStats.conversionRate}
                    </p>
                  </div>
                </div>

                {/* Mini Comparison Chart */}
                <div className="lg:col-span-5 bg-gray-50/50 dark:bg-black/20 p-3 rounded-xl border border-gray-150 dark:border-zinc-900/50 flex flex-col justify-between h-[155px] lg:h-auto">
                  <div>
                    <h5 className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Cliques Semanais
                    </h5>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                        Esta vs. Passada
                      </span>
                      <span
                        className={`text-[9px] font-black px-1 py-0.5 rounded ${
                          healthScore > 50
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {healthScore > 50 ? "+12%" : "-5%"}
                      </span>
                    </div>
                  </div>

                  <div className="h-16 w-full mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                      >
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#0d0d0d",
                            border: "1px solid #1a1a1a",
                            borderRadius: "6px",
                          }}
                          labelStyle={{ fontSize: "9px", color: "#666" }}
                          itemStyle={{
                            fontSize: "9px",
                            padding: "1px 0",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Esta Semana"
                          stroke="#3B82F6"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Semana Passada"
                          stroke="#94A3B8"
                          strokeWidth={1.5}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>Esta</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>Passada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UTM Parameters */}
            <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-150 dark:border-zinc-900/50">
              <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Parâmetros UTM Cadastrados
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "utm_source", value: campaign.utm?.source, badge: "text-blue-500 bg-blue-500/5 border-blue-500/10" },
                  { label: "utm_medium", value: campaign.utm?.medium, badge: "text-purple-500 bg-purple-500/5 border-purple-500/10" },
                  { label: "utm_campaign", value: campaign.utm?.campaign, badge: "text-amber-500 bg-amber-500/5 border-amber-500/10" },
                  { label: "utm_content", value: campaign.utm?.content, badge: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-[#0d0d0d] p-2.5 rounded-lg border border-gray-200 dark:border-zinc-900 flex flex-col justify-between group relative overflow-hidden">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.badge} w-fit mb-1.5`}>
                      {item.label}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate pr-6" title={item.value || "-"}>
                        {item.value || <span className="text-gray-400 font-normal italic">Não informado</span>}
                      </span>
                      {item.value && (
                        <button
                          onClick={() => handleCopy(item.value, item.label)}
                          className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 absolute right-1.5 bottom-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Link & QR Code Rastreável */}
        <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-150 dark:border-zinc-900/50 space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
            Link & QR Code Rastreável
          </h4>

          <div className="flex flex-col gap-4 items-center w-full">
            {/* Short URL field */}
            <div className="w-full max-w-sm">
              <div className="flex gap-2">
                <div className="flex-1 bg-white dark:bg-[#0d0d0d] p-2.5 rounded-lg border border-gray-200 dark:border-zinc-900 font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
                  {campaign.shortUrl}
                </div>
                <button
                  onClick={() => handleCopy(campaign.shortUrl, 'short')}
                  className={`p-2.5 rounded-lg transition-colors border ${copiedId === 'short' ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-800'}`}
                  title="Copiar Link"
                >
                  {copiedId === 'short' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QR Code display and download */}
            {campaign.qrCodeUrl && (
              <div className="flex flex-col items-center gap-4 bg-white dark:bg-[#0d0d0d] p-3 rounded-xl border border-gray-200 dark:border-zinc-900 w-fit">
                <div className="p-1 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <img 
                    src={campaign.qrCodeUrl} 
                    alt="QR Code" 
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <button
                  onClick={() => downloadQrCode(campaign.qrCodeUrl, campaign.name)}
                  className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar (PNG)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLeads = () => {
    // Unique options
    const sources = Array.from(new Set(mockLeads.map(l => l.utm_context.source))).filter(Boolean);
    const campaigns = Array.from(new Set(mockLeads.map(l => l.utm_context.campaign))).filter(Boolean);
    const adSets = Array.from(new Set(mockLeads.map(l => l.utm_context.ad_set || 'Geral'))).filter(Boolean);
    const creatives = Array.from(new Set(mockLeads.map(l => l.creative_context.name))).filter(Boolean);

    const filteredLeads = mockLeads.filter(lead => 
      (sourceFilter === 'all' || lead.utm_context.source === sourceFilter) &&
      (campaignFilter === 'all' || lead.utm_context.campaign === campaignFilter) &&
      (adSetFilter === 'all' || (lead.utm_context.ad_set || 'Geral') === adSetFilter) &&
      (creativeFilter === 'all' || lead.creative_context.name === creativeFilter)
    );

    return (
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

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
           <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
             <option value="all">Todas as Origens</option>
             {sources.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
           <select value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)} className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
             <option value="all">Todas as Campanhas</option>
             {campaigns.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
           <select value={adSetFilter} onChange={(e) => setAdSetFilter(e.target.value)} className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
             <option value="all">Todos os Conjuntos</option>
             {adSets.map(a => <option key={a} value={a}>{a}</option>)}
           </select>
           <select value={creativeFilter} onChange={(e) => setCreativeFilter(e.target.value)} className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
             <option value="all">Todos os Criativos</option>
             {creatives.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest">Nenhum lead encontrado...</p>
            </div>
          ) : (
            filteredLeads.map((lead, idx) => (
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

                <div className="p-8">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <ClipboardList className="w-4 h-4" /> Dados Coletados
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(lead.data).map(([key, val]) => (
                        <div key={key}>
                          <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-0.5">{key}</span>
                          <span className="text-sm font-black text-gray-800 dark:text-gray-200 break-words">{val.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col transition-all">
        
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white tracking-tight">{campaign.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg w-full">
            <button 
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'details' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Info
            </button>
            <button 
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'leads' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Leads
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
