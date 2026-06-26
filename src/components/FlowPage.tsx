import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
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
  Tag,
  Calendar,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Campaign } from "../types";
import { MOCK_CAMPAIGNS } from "../constants";
import { useRole } from "../hooks/useRole";

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

  // State for the Details Popup
  const [selectedCard, setSelectedCard] = useState<EnrichedCampaign | null>(
    null,
  );

  // Configuração das Colunas do Kanban
  const COLUMNS: {
    id: FunnelStage;
    label: string;
    color: string;
    icon: any;
    desc: string;
    badgeColor: string;
  }[] = [
    {
      id: "learning",
      label: "APRENDIZADO",
      color: "border-purple-500/20 bg-purple-500/5",
      icon: Brain,
      desc: "Fase inicial (0-39)",
      badgeColor: "bg-purple-500 text-white",
    },
    {
      id: "scaling",
      label: "ESCALANDO",
      color: "border-yellow-500/20 bg-yellow-500/5",
      icon: Rocket,
      desc: "Ganhando volume (40-64)",
      badgeColor: "bg-yellow-500 text-black",
    },
    {
      id: "performance",
      label: "PERFORMANCE",
      color: "border-emerald-500/20 bg-emerald-500/5",
      icon: Activity,
      desc: "Resultados sólidos (65-84)",
      badgeColor: "bg-emerald-500 text-white",
    },
    {
      id: "top",
      label: "TOPO",
      color: "border-blue-500/20 bg-blue-500/5",
      icon: Zap,
      desc: "Alta otimização (85-100)",
      badgeColor: "bg-blue-500 text-white",
    },
    {
      id: "warning",
      label: "ATENÇÃO",
      color: "border-red-500/20 bg-red-500/5",
      icon: AlertTriangle,
      desc: "Desempenho em queda (<40)",
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
  ];

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
      const processed = rawData.map((c) => processAutomationRules(c));
      setCampaigns(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Motor de Regras: Decide onde a campanha deve ficar baseado em dados
  const processAutomationRules = (c: Campaign): EnrichedCampaign => {
    const now = new Date();
    const created = new Date(c.createdAt);
    const diffDays = Math.ceil(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Score Simulado baseado no ID para consistência (ou random para demo)
    const pseudoRandom = c.id.charCodeAt(0) % 10;
    const baseScore = Math.min(
      100,
      Math.max(0, c.clicks / 10 + pseudoRandom * 5),
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

    // Regra 2: Atenção (< 40 com histórico)
    // Consideramos "com histórico" se tiver mais de 7 dias ou muitos cliques
    if (score < 40 && (diffDays > 7 || c.clicks > 200)) {
      stage = "warning";
      tags.push("QUEDA DE PERFORMANCE", "REVISÃO URGENTE");
    }
    // Regra 3: Aprendizado (0 – 39)
    else if (score < 40) {
      stage = "learning";
      tags.push("COLETANDO DADOS", "FASE INICIAL");
    }
    // Regra 4: Escalando (40 – 64)
    else if (score < 65) {
      stage = "scaling";
      tags.push("GANHANDO VOLUME", "OTIMIZAÇÃO");
    }
    // Regra 5: Performance (65 – 84)
    else if (score < 85) {
      stage = "performance";
      tags.push("RESULTADOS SÓLIDOS", "CONSISTENTE");
    }
    // Regra 6: Topo (85 – 100)
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
  };

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
          return processAutomationRules({ ...c, clicks: newClicks });
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
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex flex-row gap-3 h-full min-w-max px-1">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                className="flex flex-col h-full w-64 flex-shrink-0 bg-gray-100 dark:bg-[#050505] border border-gray-200 dark:border-zinc-900 rounded-lg overflow-hidden shadow-sm"
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
                        className="group bg-white dark:bg-[#0d0d0d] rounded-lg p-3 border border-gray-200 dark:border-zinc-900/50 hover:border-blue-500/50 transition-all duration-200 relative overflow-hidden shadow-sm hover:shadow-md"
                      >
                        {/* Gradient Line Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              campaign.healthScore > 80
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                                : campaign.healthScore > 50
                                  ? "bg-gradient-to-r from-blue-500 to-blue-300"
                                  : "bg-gradient-to-r from-orange-500 to-red-400"
                            }`}
                            style={{ width: `${campaign.healthScore}%` }}
                          />
                        </div>

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
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs truncate leading-tight mb-0.5">
                              {campaign.name}
                            </h4>
                            <p className="text-[9px] text-gray-500 font-mono truncate px-1 rounded w-fit">
                              {campaign.shortUrl}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowDetails(campaign);
                            }}
                            className="text-gray-300 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-fit p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
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
                              CTR
                            </span>
                            <span
                              className={`text-xs font-black ${campaign.ctr > 1.5 ? "text-emerald-500 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              {campaign.ctr}%
                            </span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {campaign.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-[#1A1F2E] text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 truncate max-w-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Health Score Label */}
                        <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase">
                          <span>Score</span>
                          <span
                            className={
                              campaign.healthScore >= 85
                                ? "text-blue-600 dark:text-blue-400"
                                : campaign.healthScore >= 65
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : campaign.healthScore >= 40
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-500 dark:text-red-400"
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

      {/* Campaign Details Popup */}
      {selectedCard &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
              className="absolute inset-0"
              onClick={() => setSelectedCard(null)}
            ></div>
            <div className="relative bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-zinc-900 overflow-hidden animate-in zoom-in-95">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-zinc-900 flex justify-between items-start bg-gray-50/50 dark:bg-black/40">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <img
                      src={selectedCard.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
                      {selectedCard.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${COLUMNS.find((c) => c.id === selectedCard.stage)?.badgeColor}`}
                      >
                        {
                          COLUMNS.find((c) => c.id === selectedCard.stage)
                            ?.label
                        }
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {new Date(selectedCard.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                    <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Cliques
                    </p>
                    <p className="text-xl font-black text-blue-700 dark:text-blue-400">
                      {selectedCard.clicks}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-center">
                    <Zap className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      CTR
                    </p>
                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                      {selectedCard.ctr}%
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-500/20 text-center">
                    <Brain className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Score
                    </p>
                    <p className="text-xl font-black text-orange-700 dark:text-orange-400">
                      {selectedCard.healthScore}
                    </p>
                  </div>
                </div>

                {/* Links & UTMs */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">
                      Link Curto
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-700 dark:text-gray-300 truncate">
                        {selectedCard.shortUrl}
                      </div>
                      <button
                        onClick={() => handleCopy(selectedCard.shortUrl)}
                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 block">
                      URL Original
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedCard.originalUrl}
                      </div>
                      <a
                        href={selectedCard.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 block">
                    Tags do Sistema
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      >
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                    {selectedCard.tags.length === 0 && (
                      <span className="text-xs text-gray-400 italic">
                        Sem tags automáticas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default FlowPage;
