import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  LineChart,
  Line,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Kanban,
  LayoutGrid,
  List,
  RefreshCw,
  Zap,
  AlertTriangle,
  PauseCircle,
  MoreHorizontal,
  Search,
  Layers,
  Rocket,
  Brain,
  ArrowRight,
  X,
  Copy,
  ExternalLink,
  Activity,
  Sliders,
  Calendar,
  Tag,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Campaign } from "../types";
import { MOCK_CAMPAIGNS } from "../constants";
import { useRole } from "../hooks/useRole";
import CampaignModal from "./CampaignModal";

// Tipos para o Motor de Automação
type FunnelStage =
  | "learning"
  | "scaling"
  | "performance"
  | "top"
  | "warning"
  | "paused";

interface EnrichedCampaign extends Campaign {
  stage: FunnelStage;
  healthScore: number;
  tags: string[];
  ctr: number; // Simulado para automação
}

const FlowPage: React.FC = () => {
  const { isSupervisor } = useRole();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
  const [isAutomating, setIsAutomating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for Configuration
  const [config, setConfig] = useState({
    learningMax: 40,
    scalingMax: 65,
    performanceMax: 85,
    attentionDaysLimit: 7,
    clickWeight: 0.1,
    randomWeight: 5
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // State for the Details Popup
  const [selectedCard, setSelectedCard] = useState<EnrichedCampaign | null>(
    null,
  );

  // Motor de Regras: Decide onde a campanha deve ficar baseado em dados
  const processAutomationRules = useCallback((c: Campaign, currentConfig: typeof config): EnrichedCampaign => {
    const now = new Date();
    const created = new Date(c.createdAt);
    const diffDays = Math.ceil(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Score Simulado baseado no ID para consistência (ou random para demo)
    const pseudoRandom = c.id.charCodeAt(0) % 10;
    const baseScore = Math.min(
      100,
      Math.max(0, c.clicks * currentConfig.clickWeight + pseudoRandom * currentConfig.randomWeight),
    );

    const score = baseScore;
    const tags: string[] = [];
    let stage: FunnelStage;

    // Regra 1: Pausado (Qualquer score)
    if (c.status === "inactive") {
      return {
        ...c,
        stage: "paused",
        healthScore: score,
        tags: ["Pausado Manual"],
        ctr: 0,
      };
    }

    // Regra 2: Atenção (< learningMax com histórico)
    if (score < currentConfig.learningMax && (diffDays > currentConfig.attentionDaysLimit || c.clicks > 200)) {
      stage = "warning";
      tags.push("QUEDA DE PERFORMANCE", "REVISÃO URGENTE");
    }
    // Regra 3: Aprendizado (0 – learningMax)
    else if (score < currentConfig.learningMax) {
      stage = "learning";
      tags.push("COLETANDO DADOS", "FASE INICIAL");
    }
    // Regra 4: Escalando (learningMax – scalingMax)
    else if (score < currentConfig.scalingMax) {
      stage = "scaling";
      tags.push("GANHANDO VOLUME", "OTIMIZAÇÃO");
    }
    // Regra 5: Performance (scalingMax – performanceMax)
    else if (score < currentConfig.performanceMax) {
      stage = "performance";
      tags.push("RESULTADOS SÓLIDOS", "CONSISTENTE");
    }
    // Regra 6: Topo (performanceMax – 100)
    else {
      stage = "top";
      tags.push("ALTA PERFORMANCE", "REFERÊNCIA");
    }

    return {
      ...c,
      stage,
      healthScore: Math.round(score),
      tags,
      ctr: parseFloat((score / 20 + 0.5).toFixed(2)),
    };
  }, []);

  // Configuração das Colunas do Kanban
  const COLUMNS = useMemo(() => [
    {
      id: "learning",
      label: "APRENDIZADO",
      color: "border-purple-500/20 bg-purple-500/5",
      icon: Brain,
      desc: `Fase inicial (0-${config.learningMax})`,
      badgeColor: "bg-purple-500 text-white",
    },
    {
      id: "scaling",
      label: "ESCALANDO",
      color: "border-yellow-500/20 bg-yellow-500/5",
      icon: Rocket,
      desc: `Ganhando volume (${config.learningMax}-${config.scalingMax})`,
      badgeColor: "bg-yellow-500 text-black",
    },
    {
      id: "performance",
      label: "PERFORMANCE",
      color: "border-emerald-500/20 bg-emerald-500/5",
      icon: Activity,
      desc: `Resultados sólidos (${config.scalingMax}-${config.performanceMax})`,
      badgeColor: "bg-emerald-500 text-white",
    },
    {
      id: "top",
      label: "TOPO",
      color: "border-blue-500/20 bg-blue-500/5",
      icon: Zap,
      desc: `Alta otimização (${config.performanceMax}-100)`,
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: "warning",
      label: "ATENÇÃO",
      color: "border-red-500/20 bg-red-500/5",
      icon: AlertTriangle,
      desc: `Desempenho em queda (<${config.learningMax})`,
      badgeColor: "bg-red-500 text-white",
    },
    {
      id: "paused",
      label: "PAUSADO",
      color: "border-gray-500/20 bg-gray-500/5",
      icon: PauseCircle,
      desc: "Interrupção estratégica",
      badgeColor: "bg-gray-500 text-white",
    },
  ], [config]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let rawData: Campaign[] = [];

      if (!isSupabaseConfigured) {
        rawData = MOCK_CAMPAIGNS;
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from("campaigns")
            .select("*")
            .eq("user_id", session.user.id);
          if (data) {
            rawData = data.map((item: any) => ({
              id: item.id,
              name: item.name,
              originalUrl: item.original_url,
              shortUrl: `ltrk.io/${item.short_code}`,
              clicks: item.clicks_count || 0,
              imageUrl:
                item.creative_url || "https://picsum.photos/200/200?grayscale",
              createdAt: item.created_at,
              status: item.is_active ? "active" : "inactive",
              utm: {
                source: item.utm_source || "",
                medium: item.utm_medium || "",
                campaign: item.utm_campaign || "",
                content: item.utm_content || "",
              },
              creativeName: item.utm_content || "Genérico",
              adSetName: item.utm_medium || "Geral",
              qrCodeUrl: item.qr_code || "",
            }));
          }
        }
      }

      // Aplica o "Motor de Automação" inicial
      const processed = rawData.map((c) => processAutomationRules(c, config));
      setCampaigns(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [config, processAutomationRules]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunAutomation = () => {
    if (isSupervisor) {
      alert("Supervisores não têm permissão para executar a automação.");
      return;
    }
    setIsAutomating(true);
    // Simula um processamento de IA/Regras com delay visual
    setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((c) => {
          // Simula mudança de dados para forçar reclassificação
          const newClicks = c.clicks + Math.floor(Math.random() * 200);
          return processAutomationRules({ ...c, clicks: newClicks }, config);
        }),
      );
      setIsAutomating(false);
    }, 1500);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [campaigns, searchTerm]);

  const getStageCount = (stage: FunnelStage) =>
    filteredCampaigns.filter((c) => c.stage === stage).length;

  const handleShowDetails = (campaign: EnrichedCampaign) => {
    setSelectedCard(campaign);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Kanban className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Flow Inteligente
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Automação baseada em regras de performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Filtrar campanhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-zinc-900 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
            />
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] p-1 rounded-lg flex items-center border border-gray-200 dark:border-zinc-900">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-all ${viewMode === "kanban" ? "bg-gray-100 dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-white" : "text-gray-500"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-gray-100 dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-white" : "text-gray-500"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {!isSupervisor && (
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-2.5 rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Sliders className="w-5 h-5" />
            </button>
          )}

          {!isSupervisor && (
            <button
              onClick={handleRunAutomation}
              disabled={isAutomating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 border border-blue-400/20 ${isAutomating ? "bg-blue-600 cursor-wait" : "bg-gradient-to-r from-blue-600 to-blue-500 hover:to-blue-600"}`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isAutomating ? "animate-spin" : ""}`}
              />
              {isAutomating ? "..." : "Automação"}
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board View - Optimized Compact Layout */}
      {viewMode === "kanban" && (
        <div className="flex-1 overflow-hidden pb-4">
          <div className="flex flex-row gap-1.5 md:gap-2 h-full w-full px-1">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                className="flex flex-col h-full flex-1 min-w-0 bg-gray-100 dark:bg-[#050505] border border-gray-200 dark:border-zinc-900 rounded-lg overflow-hidden shadow-sm"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-200 dark:border-zinc-900 bg-white dark:bg-[#0a0a0a]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg bg-opacity-10 ${col.badgeColor.split(" ")[0].replace("bg-", "bg-")}`}
                      >
                        <col.icon
                          className={`w-4 h-4 ${col.badgeColor.split(" ")[0].replace("bg-", "text-")}`}
                        />
                      </div>
                      <h3 className="font-black text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider">
                        {col.label}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${col.badgeColor}`}
                    >
                      {getStageCount(col.id)}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-500 font-medium pl-1 truncate">
                    {col.desc}
                  </p>
                </div>

                {/* Column Body */}
                <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar bg-gray-100/50 dark:bg-[#050505]/50">
                  {filteredCampaigns
                    .filter((c) => c.stage === col.id)
                    .map((campaign) => (
                      <div
                        key={campaign.id}
                        onClick={() => handleShowDetails(campaign)}
                        className="group bg-white dark:bg-[#0d0d0d] rounded-lg p-3 border border-gray-200 dark:border-zinc-900/50 hover:border-blue-500/50 transition-all duration-200 relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
                      >
                        {/* Header Card */}
                        <div className="flex gap-2 mb-2">
                          <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-black/50 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-white/5">
                            <img
                              src={campaign.imageUrl}
                              alt=""
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs truncate leading-tight mt-1">
                              {campaign.name}
                            </h4>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="bg-gray-50 dark:bg-black/30 p-1.5 rounded border border-gray-100 dark:border-white/5">
                            <span className="text-[8px] text-gray-500 uppercase font-black block">
                              Clicks
                            </span>
                            <span className="text-xs font-black text-gray-900 dark:text-white">
                              {campaign.clicks}
                            </span>
                          </div>
                          <div className="bg-gray-50 dark:bg-black/30 p-1.5 rounded border border-gray-100 dark:border-white/5">
                            <span className="text-[8px] text-gray-500 uppercase font-black block">
                              Leads
                            </span>
                            <span className="text-xs font-black text-gray-900 dark:text-white">
                              {campaign.salesCount || 0}
                            </span>
                          </div>
                        </div>

                        {/* Health Score Label */}
                        <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase">
                          <span>Score</span>
                          <span
                            className={
                              campaign.healthScore >= 85
                                ? "text-blue-600 dark:text-blue-400 font-black"
                                : campaign.healthScore >= 65
                                  ? "text-emerald-600 dark:text-emerald-400 font-black"
                                  : campaign.healthScore >= 40
                                    ? "text-yellow-600 dark:text-yellow-400 font-black"
                                    : "text-red-500 dark:text-red-400 font-black"
                            }
                          >
                            {campaign.healthScore}/100
                          </span>
                        </div>
                      </div>
                    ))}

                  {filteredCampaigns.filter((c) => c.stage === col.id)
                    .length === 0 && (
                    <div className="h-32 border-2 border-dashed border-gray-200 dark:border-[#242933] rounded-lg flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                      <Brain className="w-6 h-6 mb-2 opacity-30" />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                        Vazio
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-zinc-900 shadow-sm overflow-x-auto animate-in fade-in">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-zinc-900">
              <tr>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                  Campanha
                </th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Estágio
                </th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Score
                </th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">
                  Cliques
                </th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-900">
              {filteredCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={campaign.imageUrl}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-black"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {campaign.shortUrl}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        COLUMNS.find(
                          (c) => c.id === campaign.stage,
                        )?.badgeColor.replace(
                          "text-white",
                          "bg-opacity-20 text-opacity-100",
                        ) +
                        " " +
                        COLUMNS.find((c) => c.id === campaign.stage)
                          ?.badgeColor.split(" ")[0]
                          .replace("bg-", "text-")
                      }`}
                    >
                      {COLUMNS.find((c) => c.id === campaign.stage)?.label}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto overflow-hidden">
                      <div
                        className={`h-full ${
                          campaign.healthScore >= 85
                            ? "bg-blue-500"
                            : campaign.healthScore >= 65
                              ? "bg-emerald-500"
                              : campaign.healthScore >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${campaign.healthScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                      {campaign.healthScore}/100
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">
                    {campaign.clicks}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleShowDetails(campaign)}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simplified Legend */}
      <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-lg border border-gray-200 dark:border-zinc-900 mt-2">
         <div className="flex flex-row items-center justify-center gap-4">
            <h4 className="font-black text-gray-800 dark:text-gray-200 text-[9px] uppercase tracking-widest whitespace-nowrap">Legenda:</h4>
            <div className="flex flex-row items-center justify-center gap-3 overflow-hidden text-[9px] text-gray-500 dark:text-gray-400">
             {COLUMNS.map(col => (
               <div key={col.id} className="whitespace-nowrap">
                 <span className="font-bold text-gray-800 dark:text-gray-200">{col.label}:</span> {col.desc}
               </div>
             ))}
            </div>
         </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-zinc-900 shadow-2xl">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Configurar Automação</h3>
              <div className="space-y-4">
                {Object.entries(config).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    learningMax: 'Máximo Aprendizado',
                    scalingMax: 'Máximo Escalando',
                    performanceMax: 'Máximo Performance',
                    attentionDaysLimit: 'Atenção (Dias)',
                    clickWeight: 'Peso do Clique',
                    randomWeight: 'Peso Aleatório'
                  };
                  return (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{labels[key] || key}</label>
                    <input 
                      type="number" 
                      value={value} 
                      onChange={(e) => setConfig(prev => ({...prev, [key]: parseFloat(e.target.value)}))}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  );
                })}
              </div>
              <button onClick={() => setIsConfigOpen(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg font-bold transition-colors">Salvar Configurações</button>
           </div>
        </div>,
        document.body
      )}

      {/* Campaign Details Modal */}
      <CampaignModal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        campaign={selectedCard}
      />
    </div>
  );
};

export default FlowPage;
