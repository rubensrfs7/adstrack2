
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, RefreshCcw, Database, TrendingUp, MapPin, Map as MapIcon, MessageCircle, Link as LinkIcon, Star
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CityData } from '../types';
import { STATE_NAMES, BRAZIL_COORDS, MOCK_LOCATION_DATA } from '../constants';

// Robust MapUpdater component
const MapUpdater = () => {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    const timers = [
        setTimeout(() => map.invalidateSize(), 100),
        setTimeout(() => map.invalidateSize(), 500),
        setTimeout(() => map.invalidateSize(), 1000)
    ];
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
        timers.forEach(t => clearTimeout(t));
        window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  
  return null;
};

const LocationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    uniqueStates: 0,
    topState: '---',
    waPercentage: 0
  });

  const [topStates, setTopStates] = useState<CityData[]>([]);
  const [pointsData, setPointsData] = useState<any[]>([]);

  const fetchRealData = useCallback(async () => {
    try {
      setLoading(true);
      setDbError(null);
      
      if (!isSupabaseConfigured) {
        // Dados mocados enriquecidos para demonstração visual
        const mockRawData = MOCK_LOCATION_DATA;
        const maxMockClicks = Math.max(...mockRawData.map(d => d.count));

        const mockPoints = mockRawData.map((d, idx) => {
           const coords = BRAZIL_COORDS[d.state];
           // Simulação: Alternar entre WhatsApp e Link para demonstração
           const isWhatsApp = idx % 3 === 0 || d.state === 'SP' || d.state === 'BA'; 
           
           return {
             lat: coords.lat,
             lng: coords.lng,
             radius: (d.count / maxMockClicks) * 25 + 8, 
             color: isWhatsApp ? '#22C55E' : '#3B82F6', // Verde (WA) ou Azul (Link)
             fillColor: isWhatsApp ? '#22C55E' : '#3B82F6',
             name: `${STATE_NAMES[d.state]}`,
             count: d.count,
             type: isWhatsApp ? 'WhatsApp' : 'Link Direto',
             // Dados simulados do "Melhor Criativo" naquela região
             topCreative: {
               name: isWhatsApp ? 'Vídeo Selfie Promo' : 'Banner Estático V2',
               url: `https://picsum.photos/300/200?random=${idx + 10}`,
               ctr: (Math.random() * 2 + 1).toFixed(1)
             }
           };
        });

        setPointsData(mockPoints);
        
        setTopStates(mockRawData.slice(0, 10).map(d => ({
            name: STATE_NAMES[d.state],
            state: d.state,
            clicks: d.count
        })));

        setStats({
            totalLeads: mockRawData.reduce((acc, curr) => acc + curr.count, 0),
            uniqueStates: mockRawData.length,
            topState: 'São Paulo',
            waPercentage: 35
        });

        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      // Buscar campanhas para identificar o tipo (Chat vs Link)
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, utm_medium, original_url, creative_url, utm_content')
        .eq('user_id', session.user.id);
      
      const campaignMap: Record<string, { type: 'wa' | 'link', image: string, name: string }> = {};
      const campaignIds: string[] = [];
      
      if (campaigns) {
          campaigns.forEach(c => {
              campaignIds.push(c.id);
              // Lógica para detectar se é WA
              const isWa = c.utm_medium === 'chat' || c.original_url.includes('wa.me') || c.original_url.includes('whatsapp.com');
              campaignMap[c.id] = {
                type: isWa ? 'wa' : 'link',
                image: c.creative_url || 'https://picsum.photos/300/200?grayscale',
                name: c.utm_content || 'Anúncio Genérico'
              };
          });
      }

      if (campaignIds.length === 0) { setLoading(false); return; }

      let allClicks: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: clicksChunk, error: clicksError } = await supabase
          .from('clicks')
          .select('location_state, campaign_id')
          .in('campaign_id', campaignIds)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (clicksError) throw clicksError;

        if (clicksChunk && clicksChunk.length > 0) {
          allClicks = [...allClicks, ...clicksChunk];
          if (clicksChunk.length < pageSize) hasMore = false;
          else page++;
        } else {
          hasMore = false;
        }
      }

      const stateGroups: Record<string, { count: number, waCount: number, linkCount: number, stateCode: string, topCampaignId: string, maxCampaignClicks: number, campaignCounts: Record<string, number> }> = {};
      let totalWa = 0;

      allClicks.forEach(click => {
        const code = (click.location_state || '??').toString().trim().toUpperCase();
        if (!stateGroups[code]) {
          stateGroups[code] = { count: 0, waCount: 0, linkCount: 0, stateCode: code, topCampaignId: '', maxCampaignClicks: 0, campaignCounts: {} };
        }
        
        const campInfo = campaignMap[click.campaign_id] || { type: 'link' };
        stateGroups[code].count += 1;
        
        // Contagem para determinar Top Criativo por estado
        const cId = click.campaign_id;
        stateGroups[code].campaignCounts[cId] = (stateGroups[code].campaignCounts[cId] || 0) + 1;
        if (stateGroups[code].campaignCounts[cId] > stateGroups[code].maxCampaignClicks) {
            stateGroups[code].maxCampaignClicks = stateGroups[code].campaignCounts[cId];
            stateGroups[code].topCampaignId = cId;
        }

        if (campInfo.type === 'wa') {
            stateGroups[code].waCount += 1;
            totalWa++;
        } else {
            stateGroups[code].linkCount += 1;
        }
      });

      const groupedArray = Object.values(stateGroups).sort((a, b) => b.count - a.count);
      const maxClicks = Math.max(...groupedArray.map(c => c.count), 1);
      
      const mappedPoints = groupedArray
        .filter(c => BRAZIL_COORDS[c.stateCode])
        .map(c => {
          const coords = BRAZIL_COORDS[c.stateCode];
          // Cor baseada na maioria
          const isMajorityWa = c.waCount >= c.linkCount;
          const topCamp = campaignMap[c.topCampaignId];

          return {
            lat: coords.lat,
            lng: coords.lng,
            radius: (c.count / maxClicks) * 25 + 8,
            color: isMajorityWa ? '#22C55E' : '#3B82F6', // Verde vs Azul
            fillColor: isMajorityWa ? '#22C55E' : '#3B82F6',
            name: `${STATE_NAMES[c.stateCode]}`,
            count: c.count,
            type: isMajorityWa ? 'WhatsApp' : 'Link Direto',
            topCreative: {
                name: topCamp?.name || 'Desconhecido',
                url: topCamp?.image || 'https://picsum.photos/300/200?grayscale',
                ctr: 'N/A'
            }
          };
        });

      setPointsData(mappedPoints);
      setTopStates(groupedArray.slice(0, 10).map(c => ({ 
        name: STATE_NAMES[c.stateCode] || 'Não Identificado', 
        state: c.stateCode, 
        clicks: c.count 
      })));

      setStats({
        totalLeads: allClicks.length,
        uniqueStates: mappedPoints.length,
        topState: STATE_NAMES[mappedPoints[0]?.name] || '---',
        waPercentage: allClicks.length > 0 ? Math.round((totalWa / allClicks.length) * 100) : 0
      });

    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  if (loading) return (
    <div className="flex h-full w-full items-center justify-center bg-transparent">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">Carregando Mapa...</p>
      </div>
    </div>
  );

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-xl bg-white dark:bg-[#080A0F] border border-gray-100 dark:border-white/5 transition-colors duration-500 shadow-sm flex flex-col">
      
      <div className="relative flex-1 w-full h-full overflow-hidden">
            <div className="w-full h-full z-0" style={{ height: '100%', width: '100%' }}>
                {/* @ts-expect-error: Leaflet types mismatch */}
                <MapContainer 
                    center={[-14.2350, -51.9253]} 
                    zoom={4} 
                    style={{ height: '100%', width: '100%', background: '#111' }} 
                    zoomControl={false}
                    // A classe [&_.leaflet-tile-pane]:grayscale aplica filtro de cinza nas tiles do mapa
                    className="h-full w-full [&_.leaflet-tile-pane]:grayscale [&_.leaflet-tile-pane]:opacity-60 dark:[&_.leaflet-tile-pane]:opacity-40"
                >
                    <MapUpdater />
                    {/* @ts-expect-error: Leaflet types mismatch */}
                    <TileLayer
                        attribution='&copy; Google Maps'
                        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    />
                    {pointsData.map((p, idx) => (
                        // @ts-expect-error: Leaflet types mismatch
                        <CircleMarker 
                            key={idx} 
                            center={[p.lat, p.lng]} 
                            radius={p.radius} 
                            eventHandlers={{
                              mouseover: (e: any) => e.target.openPopup(),
                              mouseout: (e: any) => e.target.closePopup(),
                            }}
                            pathOptions={{ 
                                color: p.color, 
                                fillColor: p.fillColor, 
                                fillOpacity: 0.6,
                                weight: 2,
                                className: "animate-pulse-slow cursor-pointer"
                            }}
                        >
                            {/* @ts-expect-error: Leaflet types mismatch */}
                            <Popup className="custom-popup-large" closeButton={false}>
                                <div className="w-[220px] bg-white dark:bg-gray-900 rounded-lg overflow-hidden font-sans">
                                    {/* Header */}
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                        <div>
                                            <h3 className="font-black text-gray-800 dark:text-white text-sm leading-none">{p.name}</h3>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{p.type}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-blue-600 dark:text-blue-400 text-sm">{p.count}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase">Leads</span>
                                        </div>
                                    </div>
                                    
                                    {/* Creative Preview */}
                                    <div className="p-3">
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Performance</p>
                                        </div>
                                        
                                        <div className="relative rounded-md overflow-hidden aspect-video border border-gray-100 dark:border-gray-800 mb-2">
                                            <img src={p.topCreative.url} alt="Top Creative" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                                <p className="text-white text-[10px] font-bold truncate w-full">{p.topCreative.name}</p>
                                            </div>
                                        </div>
                                        
                                        {p.topCreative.ctr !== 'N/A' && (
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-gray-500">CTR Estimado:</span>
                                                <span className="font-bold text-green-500">{p.topCreative.ctr}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
      </div>

      {/* Interface de Monitoramento Overlay */}
      <div className="absolute inset-0 z-10 grid grid-cols-12 gap-6 p-8 pointer-events-none">
        
        {/* Painel de Estatísticas (Esquerda) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5 pointer-events-auto">
          <div className="glass-card p-6 rounded-xl border-white/5 backdrop-blur-xl bg-white/90 dark:bg-black/60 shadow-lg">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Leads Mapeados</span>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Google Data</span>
             </div>
             <div className="flex justify-between items-end">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white">{stats.totalLeads.toLocaleString()}</h2>
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                   <TrendingUp className="w-5 h-5" />
                 </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <div className="glass-card p-4 rounded-lg flex items-center gap-4 border-white/5 backdrop-blur-md bg-white/80 dark:bg-black/40">
                <div className="bg-blue-500/10 p-3 rounded-md">
                   <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Estados Ativos</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white">{stats.uniqueStates}</p>
                </div>
             </div>
             <div className="glass-card p-4 rounded-lg flex items-center gap-4 border-white/5 backdrop-blur-md bg-white/80 dark:bg-black/40">
                <div className="bg-green-500/10 p-3 rounded-md">
                   <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Dominância WhatsApp</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white">{stats.waPercentage}%</p>
                </div>
             </div>
          </div>
        </div>

        {/* Legenda (Centro Baixo) */}
        <div className="col-span-12 lg:col-span-6 relative flex flex-col items-center justify-end pb-4">
          
          <div className="flex gap-4 mb-6 pointer-events-auto">
             <div className="flex items-center gap-2 bg-white/90 dark:bg-black/60 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-lg">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Link Direto</span>
             </div>
             <div className="flex items-center gap-2 bg-white/90 dark:bg-black/60 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-md shadow-lg">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">WhatsApp</span>
             </div>
          </div>

          <div className="glass-card px-8 py-4 rounded-full border border-gray-200 dark:border-blue-500/30 flex items-center gap-6 pointer-events-auto backdrop-blur-2xl bg-white/90 dark:bg-black/60 transition-all hover:scale-105 shadow-2xl">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">Tempo Real</span>
             </div>
             <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
             <button onClick={() => fetchRealData()} className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-500 dark:hover:text-white transition-colors flex items-center gap-2">
               <RefreshCcw className="w-3 h-3" /> Sincronizar Base
             </button>
          </div>
        </div>

        {/* Lista de Ranking (Direita) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-5 pointer-events-auto">
          <div className="glass-card p-6 rounded-xl border-white/5 flex-1 flex flex-col overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-black/60 shadow-lg">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">Ranking por UF</h4>
                <Database className="w-4 h-4 text-blue-500" />
             </div>
             
             <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {topStates.length === 0 ? (
                   <div className="text-center py-20 opacity-30">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Aguardando dados...</p>
                   </div>
                ) : topStates.map((state, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black text-gray-300 dark:text-gray-600 w-4">{i + 1}</div>
                        <div className="flex flex-col">
                           <span className={`text-xs font-black group-hover:text-blue-600 transition-colors ${state.name === 'Não Identificado' ? 'text-gray-400 italic' : 'text-gray-800 dark:text-white'}`}>{state.name}</span>
                           <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">{state.state}</span>
                        </div>
                     </div>
                     <div className="text-xs font-black text-gray-700 dark:text-white bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                        {state.clicks.toLocaleString()}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
