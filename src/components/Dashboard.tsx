
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, TooltipProps, AreaChart, Area, Legend, ComposedChart
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { 
  MousePointer2, Link as LinkIcon, Activity, TrendingUp, Info, LayoutDashboard, Loader2, Map as MapIcon, Star, Users, Zap, Thermometer, ShoppingCart, Filter, Flame, ChevronLeft, ChevronRight, Facebook, Instagram, Music, Search, Globe, Linkedin, Twitter, Share2, Clock
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import CampaignModal from './CampaignModal';
import LeadModal from './LeadModal';
import { DateRangePicker } from './DateRangePicker';
import { Campaign, ChartDataPoint, DailyClickData, DailyLeadData, EvolutionData, FormResponse } from '../types';
import { PIE_CHART_DATA, EVOLUTION_DATA, DAILY_CLICKS, TOP_CREATIVES, TOP_SETS, MOCK_CAMPAIGNS, BRAZIL_COORDS, STATE_NAMES, MOCK_LOCATION_DATA } from '../constants';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const SOCIAL_MEDIA_CONFIG: Record<string, { icon: React.ComponentType<any>, color: string }> = {
  'Facebook': { icon: Facebook, color: '#1877F2' },
  'Instagram': { icon: Instagram, color: '#E1306C' },
  'TikTok': { icon: (props: any) => <image href="https://v4d.mz-css.net/72363bc2e4e6ae3d1f04fa8813b83acf/ebf794d02231ae3927e08af8cb0352f0/vecteezy_tiktok-png-icon_16716450.png" x={props.x} y={props.y} width={props.width} height={props.height} />, color: '#000000' },
  'Google': { icon: (props: any) => <image href="https://v4d.mz-css.net/72363bc2e4e6ae3d1f04fa8813b83acf/c8458652917e1b282bfbfac9ea664aeb/vecteezy_google-search-icon-google-product-illustration_12871371.png" x={props.x} y={props.y} width={props.width} height={props.height} />, color: '#4285F4' },
  'Organic': { icon: Globe, color: '#34A853' },
  'Linkedin': { icon: Linkedin, color: '#0077B5' },
  'X': { icon: (props: any) => <image href="https://v4d.mz-css.net/72363bc2e4e6ae3d1f04fa8813b83acf/73dd18a69543874078d876f43390b763/vecteezy_new-twitter-x-logo-twitter-icon-x-social-media-icon_42148611.png" x={props.x} y={props.y} width={props.width} height={props.height} />, color: '#000000' },
  'Outros': { icon: Share2, color: '#6B7280' }
};

// Componente para garantir renderização correta do mapa ao redimensionar
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

const FunnelStep = ({ label, value, color, max, visualMax, small, overridePercentage }: { label: string, value: number, color: string, max: number, visualMax?: number, small?: boolean, overridePercentage?: number }) => {
  const rawPercentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const percentage = overridePercentage ?? (rawPercentage <= 12 ? 13 : rawPercentage);
  const displayPercentage = overridePercentage ?? ((visualMax || max) > 0 ? (value / (visualMax || max)) * 100 : 0);
  const displayValue = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value;

  return (
    <div className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-6 ${small ? 'h-auto' : 'h-auto'}`}>
      <span className={`w-full lg:w-28 text-center lg:text-right font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight ${small ? 'text-[9px]' : 'text-[10px] lg:text-xs'}`}>
        {label}
      </span>
      <div className={`w-full lg:flex-1 ${small ? 'h-8' : 'h-10 lg:h-14'} bg-gray-100/50 dark:bg-zinc-900/30 rounded-xl relative overflow-hidden flex justify-center border border-transparent dark:border-zinc-800/5 shadow-inner`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(20, displayPercentage)}%` }}
          className={`h-full ${color} rounded-lg flex items-center justify-center min-w-fit shadow-sm relative`}
        >
          <span className="text-[10px] font-black text-white px-2 z-10">
            {percentage}%
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
        </motion.div>
      </div>
      <span className={`w-full lg:w-24 text-center lg:text-left font-black text-gray-800 dark:text-white ${small ? 'text-xs' : 'text-sm'}`}>
        {displayValue}
      </span>
    </div>
  );
};

const MultiSegmentFunnelStep = ({ label, segments, max, visualMax }: { label: string, segments: { label: string, value: number, color: string }[], max: number, visualMax: number }) => {
  const displayTotal = segments.reduce((acc, s) => acc + s.value, 0);
  const formattedTotal = displayTotal >= 1000 ? `${(displayTotal / 1000).toFixed(1)}K` : displayTotal;
  const totalPercentage = max > 0 ? Math.round((displayTotal / max) * 100) : 0;
  
  return (
    <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-6 h-auto">
      <span className="w-full lg:w-28 text-center lg:text-right font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight text-[10px] lg:text-xs">
        {label}
      </span>
      <div className="w-full lg:flex-1 h-10 lg:h-14 bg-gray-100/50 dark:bg-zinc-900/30 rounded-xl relative overflow-hidden flex justify-center border border-transparent dark:border-zinc-800/5 shadow-inner">
        <div className="flex h-full w-full justify-center">
          {segments.map((seg, idx) => {
            const labelPercentage = displayTotal > 0 ? Math.round((seg.value / displayTotal) * 100) : 0;
            const widthPercentage = labelPercentage;
            
            if (seg.value === 0) return null;
            
            return (
              <motion.div
                key={idx}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(10, widthPercentage)}%` }}
                className={`h-full ${seg.color} flex items-center justify-center min-w-fit px-1.5 border-r border-white/5 last:border-r-0 relative group/seg shadow-sm first:rounded-l-lg last:rounded-r-lg`}
              >
                <span className="text-[9px] font-black text-white whitespace-nowrap px-1 z-10">
                  {labelPercentage}%
                </span>
                
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover/seg:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl uppercase tracking-widest border border-gray-100 dark:border-zinc-800">
                  {seg.label}: {seg.value} ({labelPercentage}%)
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
      <span className="w-full lg:w-24 text-center lg:text-left font-black text-gray-800 dark:text-white text-sm">
        {formattedTotal}
      </span>
    </div>
  );
};

const getSafeDate = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return new Date();
  return d;
};

const HeatMap: React.FC<{ endDate: string; onDateSelect: (date: string) => void }> = ({ endDate, onDateSelect }) => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const parsedEndDate = getSafeDate(endDate);
  const [currentMonthIdx, setCurrentMonthIdx] = React.useState(Number.isNaN(parsedEndDate.getMonth()) ? new Date().getMonth() : parsedEndDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(Number.isNaN(parsedEndDate.getFullYear()) ? new Date().getFullYear() : parsedEndDate.getFullYear());

  React.useEffect(() => {
    const d = getSafeDate(endDate);
    setCurrentMonthIdx(d.getMonth());
    setCurrentYear(d.getFullYear());
  }, [endDate]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarData = React.useCallback((month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const totalDays = daysInMonth + firstDay;
    const weeksCount = Math.ceil(totalDays / 7);
    
    // Deterministic random based on month/year/day
    const seed = month + year * 12;
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const calendar = [];
    let dayCounter = 1;

    for (let w = 0; w < weeksCount; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        if (idx < firstDay || dayCounter > daysInMonth) {
          week.push(null);
        } else {
          const daySeed = seed + dayCounter;
          const clicks = Math.round(50 + random(daySeed) * 200);
          const leads = Math.round(clicks * (0.05 + random(daySeed + 1) * 0.15));
          const sales = Math.round(leads * (0.1 + random(daySeed + 2) * 0.2));
          const score = (clicks / 250) * 0.3 + (leads / 40) * 0.4 + (sales / 10) * 0.3;
          
          week.push({
            day: dayCounter,
            clicks,
            leads,
            sales,
            score: Math.min(score * 100, 100)
          });
          dayCounter++;
        }
      }
      calendar.push(week);
    }
    return calendar;
  }, []);

  const calendarData = React.useMemo(() => generateCalendarData(currentMonthIdx, currentYear), [currentMonthIdx, currentYear, generateCalendarData]);

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return 'bg-orange-950 dark:bg-yellow-950 text-white';
    if (score >= 60) return 'bg-orange-900 dark:bg-yellow-900 text-white';
    if (score >= 40) return 'bg-orange-600 dark:bg-yellow-700 text-white';
    if (score >= 25) return 'bg-orange-400 dark:bg-yellow-500 text-orange-950';
    if (score >= 10) return 'bg-orange-200 dark:bg-yellow-300 text-orange-900';
    return 'bg-orange-50 dark:bg-yellow-100 text-orange-800';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex flex-col">
          <span className="text-xl font-black text-gray-900 dark:text-white capitalize">
            {months[Number.isNaN(currentMonthIdx) ? 0 : currentMonthIdx] || 'Mês'}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {Number.isNaN(currentYear) ? new Date().getFullYear() : currentYear}
          </span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-tight">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col gap-1 flex-1 min-h-[300px]">
        {calendarData.map((week, wIdx) => (
          <div key={wIdx} className="grid grid-cols-7 gap-1">
            {week.map((item, dIdx) => {
              if (!item) return <div key={dIdx} className="h-10 md:h-12 bg-transparent" />;
              
              return (
                <motion.div
                  key={dIdx}
                  onClick={() => {
                    const d = new Date(currentYear, currentMonthIdx, item.day);
                    // fix timezone offset issues
                    const dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    onDateSelect(dateStr);
                  }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  className={`h-10 md:h-12 rounded-[4px] flex flex-col items-center justify-center text-[11px] font-black shadow-sm transition-all cursor-pointer border border-transparent hover:border-white/20 group relative ${getBgColor(item.score)} ${endDate === new Date(new Date(currentYear, currentMonthIdx, item.day).getTime() - (new Date(currentYear, currentMonthIdx, item.day).getTimezoneOffset() * 60000)).toISOString().split('T')[0] ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#0a0a0a]' : ''}`}
                >
                  <span className="opacity-80">{item.day}</span>
                  
                  {/* Custom Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white dark:bg-zinc-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl flex flex-col gap-1 text-[9px] uppercase tracking-tighter border border-gray-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-1 mb-1">
                      <span className="text-gray-400 dark:text-gray-500">Dia {item.day}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                      <span>Cliques</span>
                      <span className="font-black text-gray-900 dark:text-white">{item.clicks}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                      <span>Leads</span>
                      <span className="font-black text-gray-900 dark:text-white">{item.leads}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                      <span>Vendas</span>
                      <span className="font-black text-gray-900 dark:text-white">{item.sales}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const getFilteredChartData = (type: string) => {
    return dailyClicksData.map(d => ({
      ...d,
      clicks: Math.floor(d.clicks * (
        type === 'clicks' ? (0.8 + Math.random() * 0.4) : 
        type === 'active' ? (0.1 + Math.random() * 0.2) : 
        type === 'today' ? (0.4 + Math.random() * 0.4) : 
        type === 'leads' ? (0.2 + Math.random() * 0.4) : 
        (0.05 + Math.random() * 0.1)
      ))
    }));
  };

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedLead, setSelectedLead] = useState<FormResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [kpiData, setKpiData] = useState({ 
    total: 0, 
    active: 0, 
    average: 0, 
    today: 0,
    leads: 0,
    sales: 0,
    conversionRate: 0,
    spend: 0
  });
  const [pieData, setPieData] = useState<ChartDataPoint[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [dailyClicksData, setDailyClicksData] = useState<DailyClickData[]>([]);
  const [dailyLeadsData, setDailyLeadsData] = useState<DailyLeadData[]>([]);
  const mergedDailyData = React.useMemo(() => {
    return dailyClicksData.map(d => ({
      ...d,
      leads: dailyLeadsData.find(l => l.day === d.day)?.leads || 0
    }));
  }, [dailyClicksData, dailyLeadsData]);
  const [topCampaigns, setTopCampaigns] = useState<Campaign[]>([]);
  const [selectedPieName, setSelectedPieName] = useState<string | null>(null);
  const [leadCombinedData, setLeadCombinedData] = useState<any[]>([]);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [hourlyLeadsData, setHourlyLeadsData] = useState<any[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentLeads, setRecentLeads] = useState<FormResponse[]>([]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      if (!isSupabaseConfigured) {
        // Simulação de dados baseada no range de datas para o mock
        const start = getSafeDate(startDate);
        const end = getSafeDate(endDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const baseMultiplier = Math.max(0.1, (Number.isNaN(diffDays) ? 1 : diffDays) / 30);
        const dateJitter = 0.5 + (Math.sin(start.getDate() + end.getDate() * 2) * 0.5 + 0.5);
        const multiplier = baseMultiplier * (Number.isNaN(dateJitter) ? 1 : dateJitter);

        setPieData(PIE_CHART_DATA.map(d => ({ ...d, value: Math.round(d.value * 1.5 * multiplier) })));
        setEvolutionData(EVOLUTION_DATA);
        setDailyClicksData(DAILY_CLICKS);
        setDailyLeadsData(DAILY_CLICKS.map(d => ({ day: d.day, leads: Math.round(d.clicks * 0.1) })));
        setTopCampaigns(MOCK_CAMPAIGNS.slice(0, 5).map(c => ({ ...c, score: Math.round(c.clicks * 1.2 + (c.clicks * 0.1) * 8.5) })));
        
        const mockLeads = Math.round(150 * multiplier);
        const mockSales = Math.round(12 * multiplier);
        const totalClicks = Math.round(MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.clicks, 0) * multiplier);
        const conversionRate = totalClicks > 0 ? (mockLeads / totalClicks) * 100 : 0;

        setKpiData({
          total: totalClicks,
          active: MOCK_CAMPAIGNS.filter(c => c.status === 'active').length,
          average: Math.round(totalClicks / MOCK_CAMPAIGNS.length),
          today: Math.round(452 * (multiplier > 1 ? 1 : multiplier)),
          leads: mockLeads,
          sales: mockSales,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          spend: 1250 * multiplier
        });

        setRecentLeads(
          Array.from({ length: 10 }).map((_, i) => ({
            id: `${i + 1}`,
            campaign_id: `${(i % 5) + 1}`,
            data: { 
              'Nome': ['Ricardo Santos', 'Mariana Oliveira', 'João Silva', 'Ana Souza', 'Pedro Lima', 'Carla Dias', 'Lucas Ferreira', 'Beatriz Costa', 'Gabriel Alves', 'Fernanda Mendes'][i], 
              'Email': ['ricardo@exemplo.com', 'mariana@exemplo.com', 'joao@exemplo.com', 'ana@exemplo.com', 'pedro@exemplo.com', 'carla@exemplo.com', 'lucas@exemplo.com', 'beatriz@exemplo.com', 'gabriel@exemplo.com', 'fernanda@exemplo.com'][i],
              'WhatsApp': ['(11) 99999-1111', '(11) 99999-2222', '(11) 99999-3333', '(11) 99999-4444', '(11) 99999-5555', '(11) 99999-6666', '(11) 99999-7777', '(11) 99999-8888', '(11) 99999-9999', '(11) 99999-0000'][i]
            },
            utm_context: { source: 'google', medium: 'cpc', campaign: 'pesquisa', content: 'texto' },
            creative_context: { name: 'Lead', image_url: 'https://picsum.photos/200/200?random=' + i },
            created_at: new Date(Date.now() - i * 3600000).toISOString(),
            mock_form_response: i % 3 === 0 ? {
                'Qual é o seu orçamento?': 'R$ 5.000 - R$ 10.000',
                'Quais seus objetivos?': 'Aumentar leads',
                'Como nos conheceu?': 'Google'
            } : null
          }))
        );
        
        // Mock Map Data
        const maxMockClicks = Math.max(...MOCK_LOCATION_DATA.map(d => d.count));
        const mockMapPoints = MOCK_LOCATION_DATA.map((d, idx) => {
           const coords = BRAZIL_COORDS[d.state];
           const isWhatsApp = idx % 3 === 0 || d.state === 'SP' || d.state === 'BA';
           return {
             lat: coords.lat,
             lng: coords.lng,
             radius: (d.count / maxMockClicks) * 10 + 5,
             color: isWhatsApp ? '#22C55E' : '#3B82F6',
             fillColor: isWhatsApp ? '#22C55E' : '#3B82F6',
             name: STATE_NAMES[d.state],
             count: Math.round(d.count * multiplier),
             type: isWhatsApp ? 'WhatsApp' : 'Link Direto',
             topCreative: {
               name: isWhatsApp ? 'Vídeo Selfie Promo' : 'Banner Estático V2',
               url: `https://picsum.photos/300/200?random=${idx + 10}`,
               ctr: (Math.random() * 2 + 1).toFixed(1)
             }
           };
        });
        setMapPoints(mockMapPoints);
        
        // Mock Lead Combined Data
        const sourceBases = [
          { name: 'Facebook', base: 3200 },
          { name: 'Instagram', base: 4900 },
          { name: 'Organic', base: 2100 },
          { name: 'TikTok', base: 2000 },
          { name: 'Google', base: 3600 },
          { name: 'Linkedin', base: 1400 },
          { name: 'X', base: 890 },
          { name: 'Outros', base: 760 }
        ];

        setLeadCombinedData(sourceBases.map(s => {
          const lds = Math.round(s.base * multiplier * (0.8 + Math.random() * 0.4));
          const cvs = Math.round(lds * (0.02 + Math.random() * 0.08));
          return {
            name: s.name,
            leads: lds,
            conversions: cvs,
            conversionRate: lds > 0 ? (cvs / lds) * 100 : 0
          };
        }).sort((a, b) => b.leads - a.leads));

        // Mock Hourly Data
        const hourlyBases = [
          { time: '00:00', leads: 50 },
          { time: '02:00', leads: 20 },
          { time: '04:00', leads: 10 },
          { time: '06:00', leads: 60 },
          { time: '08:00', leads: 150 },
          { time: '10:00', leads: 320 },
          { time: '12:00', leads: 400 },
          { time: '14:00', leads: 380 },
          { time: '16:00', leads: 300 },
          { time: '18:00', leads: 450 },
          { time: '20:00', leads: 520 },
          { time: '22:00', leads: 280 }
        ];

        setHourlyLeadsData(hourlyBases.map(h => ({
          time: h.time,
          leads: Math.round(h.leads * multiplier * (0.8 + Math.random() * 0.4))
        })));
        
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Buscar Campanhas
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', session.user.id);

      if (campaignsError) throw campaignsError;

      const baseUrl = window.location.origin + window.location.pathname;

      const formattedCampaigns: Campaign[] = (campaignsData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        originalUrl: item.original_url,
        shortUrl: `${baseUrl}#/r/${item.short_code}`,
        clicks: item.clicks_count || 0,
        imageUrl: item.creative_url || 'https://picsum.photos/200/200?grayscale',
        createdAt: item.created_at,
        qrCodeUrl: item.qr_code,
        utm: {
            source: item.utm_source || '',
            medium: item.utm_medium || '',
            campaign: item.utm_campaign || '',
            content: item.utm_content || ''
        },
        creativeName: item.utm_content || 'Sem Nome',
        adSetName: item.utm_medium || 'Geral',
        status: item.is_active ? 'active' : 'inactive'
      }));

      const campaignIds = formattedCampaigns.map(c => c.id);
      
      // 2. BUSCAR CLIQUES NO RANGE DE DATAS
      let filteredClicks: any[] = [];
      if (campaignIds.length > 0) {
          let hasMore = true;
          let page = 0;
          const pageSize = 1000;

          while (hasMore) {
              const { data: clicksChunk, error: clicksError } = await supabase
                  .from('clicks')
                  .select('clicked_at, campaign_id, location_state')
                  .in('campaign_id', campaignIds)
                  .gte('clicked_at', `${startDate}T00:00:00Z`)
                  .lte('clicked_at', `${endDate}T23:59:59Z`)
                  .range(page * pageSize, (page + 1) * pageSize - 1);

              if (clicksError) break;

              if (clicksChunk && clicksChunk.length > 0) {
                  filteredClicks = [...filteredClicks, ...clicksChunk];
                  if (clicksChunk.length < pageSize) hasMore = false;
                  else page++;
              } else {
                  hasMore = false;
              }
          }
      }

      const totalClicks = filteredClicks.length;
      const activeCampaigns = formattedCampaigns.filter(c => c.status === 'active').length;
      const avgClicks = formattedCampaigns.length > 0 ? Math.round(totalClicks / formattedCampaigns.length) : 0;

      // Contagem de cliques por campanha
      const campaignClickCounts: Record<string, number> = {};
      filteredClicks.forEach(c => {
          campaignClickCounts[c.campaign_id] = (campaignClickCounts[c.campaign_id] || 0) + 1;
      });

      // Mapeamento auxiliar
      const campaignMap: Record<string, { type: 'wa' | 'link', image: string, name: string }> = {};
      formattedCampaigns.forEach(c => {
          const isWa = c.utm.medium === 'chat' || c.originalUrl.includes('wa.me') || c.originalUrl.includes('whatsapp.com');
          campaignMap[c.id] = {
              type: isWa ? 'wa' : 'link',
              image: c.imageUrl,
              name: c.creativeName
          };
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const clicksTodayCount = filteredClicks.filter(c => c.clicked_at.startsWith(todayStr)).length;

      // 5. BUSCAR LEADS NO RANGE DE DATAS
      const { data: leadsData, error: leadsError } = await supabase
        .from('form_responses')
        .select('id, data, created_at, campaign_id')
        .in('campaign_id', campaignIds)
        .gte('created_at', `${startDate}T00:00:00Z`)
        .lte('created_at', `${endDate}T23:59:59Z`)
        .order('created_at', { ascending: false });

      const totalLeads = leadsData?.length || 0;

      const sourceCounts: Record<string, number> = {};
      (leadsData || []).forEach((l: any) => {
          const campaign = formattedCampaigns.find(c => c.id === l.campaign_id);
          const source = campaign?.utm.source || 'Outros';
          
          // Normalize sources
          const sourceMap: Record<string, string> = {
              'facebook': 'Facebook', 'fb': 'Facebook',
              'instagram': 'Instagram', 'insta': 'Instagram',
              'tiktok': 'TikTok',
              'google': 'Google', 'google_ads': 'Google',
              'organic': 'Organic',
              'linkedin': 'Linkedin',
              'x': 'X'
          };
          
          const normalizedSource = sourceMap[source.toLowerCase()] || 'Outros';
          sourceCounts[normalizedSource] = (sourceCounts[normalizedSource] || 0) + 1;
      });

      const finalSourceCounts = Object.keys(sourceCounts).length > 0 ? sourceCounts : {
          'Facebook': 3200,
          'Instagram': 4900,
          'Organic': 2100,
          'TikTok': 2000,
          'Google': 3600,
          'Linkedin': 1400,
          'X': 890,
          'Outros': 760
      };

      setLeadCombinedData(Object.entries(finalSourceCounts).map(([name, value]) => {
          const conversions = Math.round(value * (Math.random() * 0.1 + 0.05)); // 5 to 15% conversion roughly
          const conversionRate = value > 0 ? (conversions / value) * 100 : 0;
          return {
              name,
              leads: value,
              conversions,
              conversionRate
          };
      }).sort((a, b) => b.leads - a.leads));

      const totalSales = leadsData?.filter((l: any) => l.data?.status === 'Convertido' || l.data?.Status === 'Convertido').length || Math.round(totalLeads * 0.08);
      
      setRecentLeads((leadsData || []).slice(0, 5).map((l: any) => ({
        id: l.id,
        campaign_id: l.campaign_id,
        data: l.data,
        utm_context: formattedCampaigns.find(c => c.id === l.campaign_id)?.utm || { source: '', medium: '', campaign: '', content: '' },
        creative_context: {
          name: formattedCampaigns.find(c => c.id === l.campaign_id)?.creativeName || 'Desconhecido',
          image_url: formattedCampaigns.find(c => c.id === l.campaign_id)?.imageUrl || 'https://picsum.photos/200/200?grayscale'
        },
        created_at: l.created_at
      })));

      // Calcular leads por campanha para o score
      const campaignLeadsCounts: Record<string, number> = {};
      (leadsData || []).forEach((l: any) => {
          campaignLeadsCounts[l.campaign_id] = (campaignLeadsCounts[l.campaign_id] || 0) + 1;
      });

      // Calcular score fictício para cada campanha
      const campaignsWithScore = formattedCampaigns.map(c => {
          const clicks = campaignClickCounts[c.id] || 0;
          const leads = campaignLeadsCounts[c.id] || 0;
          // Score fictício: cliques * 1.2 + leads * 8.5
          const score = Math.round(clicks * 1.2 + leads * 8.5);
          return { ...c, score };
      });

      const sortedCampaigns = [...campaignsWithScore].sort((a, b) => (b.score || 0) - (a.score || 0));
      const top5 = sortedCampaigns.slice(0, 5);
      setTopCampaigns(top5);
      
      setPieData(top5.map(c => ({
          name: c.name,
          value: c.score || 0,
          image: c.imageUrl
      })).filter(d => d.value > 0));

      const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;

      setKpiData({ 
        total: totalClicks, 
        active: activeCampaigns, 
        average: avgClicks, 
        today: clicksTodayCount,
        leads: totalLeads,
        sales: totalSales,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        spend: totalClicks * 0.45 // Mock spend based on CPC
      });

      // 3. Preparar Datas para Gráficos (baseado no range selecionado ou últimos 7 dias se o range for grande)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const chartDays = Math.min(diffDays, 14); // Limitar a 14 dias para o gráfico não ficar poluído
      const dates: string[] = [];
      for (let i = 0; i < chartDays; i++) {
          const d = new Date(endDate);
          d.setDate(d.getDate() - (chartDays - 1 - i));
          dates.push(d.toISOString().split('T')[0]);
      }

      const top3Ids = top5.slice(0, 3).map(c => c.id);
      setEvolutionData(dates.map(date => ({
          date: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          campaignA: filteredClicks.filter(c => c.clicked_at.startsWith(date) && c.campaign_id === top3Ids[0]).length,
          campaignB: filteredClicks.filter(c => c.clicked_at.startsWith(date) && c.campaign_id === top3Ids[1]).length,
          campaignC: filteredClicks.filter(c => c.clicked_at.startsWith(date) && c.campaign_id === top3Ids[2]).length,
      })));

      setDailyClicksData(dates.map(date => ({
           day: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
           clicks: filteredClicks.filter(c => c.clicked_at.startsWith(date)).length
      })));

      setDailyLeadsData(dates.map(date => ({
           day: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
           leads: (leadsData || []).filter((l: any) => l.created_at.startsWith(date)).length
      })));

      // 4. MAP DATA
      const stateGroups: Record<string, { count: number, waCount: number, linkCount: number, campaignCounts: Record<string, number> }> = {};
      
      filteredClicks.forEach((c: any) => {
          const code = (c.location_state || '??').toUpperCase();
          if (!stateGroups[code]) {
              stateGroups[code] = { count: 0, waCount: 0, linkCount: 0, campaignCounts: {} };
          }
          stateGroups[code].count += 1;
          stateGroups[code].campaignCounts[c.campaign_id] = (stateGroups[code].campaignCounts[c.campaign_id] || 0) + 1;

          const cInfo = campaignMap[c.campaign_id] || { type: 'link' };
          if (cInfo.type === 'wa') stateGroups[code].waCount++;
          else stateGroups[code].linkCount++;
      });

      const maxClicks = Math.max(...Object.values(stateGroups).map(s => s.count), 1);
      
      const mappedPoints = Object.entries(stateGroups)
          .filter(([code]) => BRAZIL_COORDS[code])
          .map(([code, stats]) => {
              const coords = BRAZIL_COORDS[code];
              const isMajorityWa = stats.waCount >= stats.linkCount;
              
              let topCampId = '';
              let maxCampClicks = 0;
              Object.entries(stats.campaignCounts).forEach(([cId, count]) => {
                  if (count > maxCampClicks) {
                      maxCampClicks = count;
                      topCampId = cId;
                  }
              });
              const topCamp = campaignMap[topCampId];

              return {
                  lat: coords.lat,
                  lng: coords.lng,
                  radius: (stats.count / maxClicks) * 10 + 5,
                  color: isMajorityWa ? '#22C55E' : '#3B82F6',
                  fillColor: isMajorityWa ? '#22C55E' : '#3B82F6',
                  name: STATE_NAMES[code],
                  count: stats.count,
                  type: isMajorityWa ? 'WhatsApp' : 'Link Direto',
                  topCreative: {
                      name: topCamp?.name || 'Desconhecido',
                      url: topCamp?.image || 'https://picsum.photos/300/200?grayscale',
                      ctr: 'N/A'
                  }
              };
          });
      setMapPoints(mappedPoints);

      // Hourly Data mock (even for real data, as requested)
      const startObj = new Date(startDate);
      const endObj = new Date(endDate);
      const realDiffDays = Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const baseMult = Math.max(0.1, realDiffDays / 30);
      const dateJit = 0.5 + (Math.sin(startObj.getDate() + endObj.getDate() * 2) * 0.5 + 0.5);
      const hourlyMult = baseMult * dateJit;

      const hourlyBases = [
        { time: '00:00', leads: 50 },
        { time: '02:00', leads: 20 },
        { time: '04:00', leads: 10 },
        { time: '06:00', leads: 60 },
        { time: '08:00', leads: 150 },
        { time: '10:00', leads: 320 },
        { time: '12:00', leads: 400 },
        { time: '14:00', leads: 380 },
        { time: '16:00', leads: 300 },
        { time: '18:00', leads: 450 },
        { time: '20:00', leads: 520 },
        { time: '22:00', leads: 280 }
      ];

      setHourlyLeadsData(hourlyBases.map(h => ({
        time: h.time,
        leads: Math.round(h.leads * hourlyMult * (0.8 + Math.random() * 0.4))
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const chartTheme = {
    gridColor: isDark ? '#1f2937' : '#E5E7EB',
    textColor: isDark ? '#9CA3AF' : '#6B7280',
    tooltipBg: isDark ? '#111827' : '#FFFFFF',
    tooltipBorder: isDark ? '#374151' : '#E5E7EB',
    tooltipText: isDark ? '#F3F4F6' : '#111827',
  };

  const funnelData = React.useMemo(() => {
    if (!selectedPieName) {
      // Add slight randomness to base values if they are default mocks
      const clicksBase = kpiData.total > 0 ? kpiData.total : 12450;
      const clicks = Math.round(clicksBase * (0.95 + Math.random() * 0.1));
      
      const leads = Math.round(clicks * (0.1 + Math.random() * 0.05));
      const sales = Math.round(leads * (0.05 + Math.random() * 0.05));

      const fRatio = 0.35 + Math.random() * 0.1;
      const mRatio = 0.3 + Math.random() * 0.1;
      
      const f = Math.round(leads * fRatio);
      const m = Math.round(leads * mRatio);
      const q = leads - f - m;

      return { clicks, leads, sales, frio: f, morno: m, quente: q };
    }

    const campaign = topCampaigns.find(c => c.name === selectedPieName);
    if (!campaign) {
      return { clicks: 0, leads: 0, sales: 0, frio: 0, morno: 0, quente: 0 };
    }

    const clicks = campaign.clicks || 0;
    // Simulação proporcional mais realista
    const leads = Math.round(clicks * (0.08 + Math.random() * 0.07)); // 8% a 15%
    const sales = Math.round(leads * (0.05 + Math.random() * 0.1)); // 5% a 15%
    
    const fRatio = 0.3 + Math.random() * 0.2;
    const mRatio = 0.3 + Math.random() * 0.2;
    
    const f = Math.round(leads * fRatio);
    const m = Math.round(leads * mRatio);
    const q = leads - f - m;

    return {
      clicks,
      leads,
      sales,
      frio: f,
      morno: m,
      quente: q
    };
  }, [selectedPieName, kpiData, topCampaigns]);

  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 p-1.5 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg max-w-[120px]">
          <p className="text-[10px] font-semibold mb-0.5 text-center text-gray-900 dark:text-gray-100">{data.name}</p>
          {data.image && <img src={data.image} alt={data.name} className="w-full h-auto rounded-md mb-0.5 object-cover" />}
          <p className="text-[9px] text-center text-gray-600 dark:text-gray-400">{data.value.toLocaleString()} score</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center text-blue-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-4 pb-8">
      {/* Fix for z-index stacking issues in dashboard map */}
      <style>{`
        .dashboard-map .leaflet-pane { z-index: unset !important; }
        .dashboard-map .leaflet-top, .dashboard-map .leaflet-bottom { z-index: 1000 !important; }
        .dashboard-map .leaflet-popup-pane { z-index: 700 !important; }
        .dashboard-map .leaflet-marker-pane { z-index: 600 !important; }
        .dashboard-map .leaflet-overlay-pane { z-index: 400 !important; }
        .dashboard-map .leaflet-tile-pane { z-index: 200 !important; }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Dashboard
        </h1>

        <div className="flex flex-col items-end gap-2">
          <span className="text-base text-gray-800 dark:text-white">
            {(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 12) return 'Bom dia';
              if (hour >= 12 && hour < 18) return 'Boa tarde';
              return 'Boa noite';
            })()}, <span className="font-bold">Rubens</span>
          </span>
          <div className="flex items-center gap-3">
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: 'CLIQUES HOJE', value: kpiData.total.toLocaleString(), icon: MousePointer2, color: 'blue', data: getFilteredChartData('clicks'), percentage: '+12%' },
          { title: 'ATIVAS HOJE', value: kpiData.active.toLocaleString(), icon: LayoutDashboard, color: 'purple', data: getFilteredChartData('active'), percentage: '-4%' },
          { title: 'LEADS HOJE', value: kpiData.today.toLocaleString(), icon: Activity, color: 'rose', data: getFilteredChartData('today'), percentage: '+18%' },
          { title: 'TOTAL LEADS', value: kpiData.leads.toLocaleString(), icon: Users, color: 'emerald', data: getFilteredChartData('leads'), percentage: '+25%' },
          { title: 'CONV. HOJE', value: `${kpiData.conversionRate}%`, icon: Zap, color: 'amber', data: getFilteredChartData('conversion'), percentage: '-1.5%' },
        ].map((stat, index) => (
          <motion.div 
            key={`${index}`} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-3xl border border-transparent shadow-lg bg-gradient-to-br ${
              stat.color === 'blue' ? 'from-blue-500 to-blue-700' :
              stat.color === 'emerald' ? 'from-emerald-500 to-emerald-700' :
              stat.color === 'amber' ? 'from-amber-500 to-amber-700' :
              stat.color === 'rose' ? 'from-rose-500 to-rose-700' :
              'from-purple-500 to-purple-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-2xl bg-white/20 text-white">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full">{stat.percentage}</span>
            </div>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">{stat.title}</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              {stat.data && (
                <div className="h-10 w-20">
                  <ResponsiveContainer width="100%" height="100%" key={JSON.stringify(stat.data)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          className="lg:col-span-3 bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 transition-all flex flex-col"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Distribuição (Top 5)
            </span>
            {selectedPieName && (
              <button 
                onClick={() => setSelectedPieName(null)}
                className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
              >
                Limpar Filtro
              </button>
            )}
          </h3>
          <div className="flex-1 w-full flex items-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="45%" 
                  innerRadius={90} 
                  outerRadius={130} 
                  cornerRadius={8}
                  fill="#8884d8" 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke={isDark ? '#111827' : '#fff'}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="bold">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                  onClick={(data) => {
                    if (data && data.name) {
                      setSelectedPieName(selectedPieName === data.name ? null : data.name);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke={selectedPieName === entry.name ? '#3B82F6' : (isDark ? '#111827' : '#fff')}
                      strokeWidth={selectedPieName === entry.name ? 3 : 1}
                      className="transition-all duration-300"
                      opacity={selectedPieName ? (selectedPieName === entry.name ? 1 : 0.3) : 1}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-gray-600 dark:text-gray-300 text-xs font-medium ml-1">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Funil de Vendas */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          className="lg:col-span-6 transition-all flex flex-col bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" /> 
            Funil de Conversão {selectedPieName ? `- ${selectedPieName}` : '(Geral)'}
          </h3>

          <div className="flex flex-col gap-6 flex-1 justify-center py-6">
            <FunnelStep label="Cliques" value={funnelData.clicks} color="bg-blue-600" max={funnelData.clicks} />
            <FunnelStep label="Leads" value={funnelData.leads} color="bg-blue-500" max={funnelData.clicks} visualMax={funnelData.clicks} overridePercentage={65} />
            
            <MultiSegmentFunnelStep 
              label="Qualidade" 
              max={funnelData.leads}
              visualMax={funnelData.clicks}
              segments={[
                { label: 'Frio', value: funnelData.frio, color: 'bg-blue-500' },
                { label: 'Morno', value: funnelData.morno, color: 'bg-amber-500' },
                { label: 'Quente', value: funnelData.quente, color: 'bg-rose-500' }
              ]}
            />

            <FunnelStep label="Vendas" value={funnelData.sales} color="bg-emerald-600" max={funnelData.leads} visualMax={funnelData.clicks} />
          </div>
        </motion.div>

        {/* Mapa de Calor */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          className="lg:col-span-3 transition-all flex flex-col bg-yellow-50 dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Flame className="w-4 h-4 text-gray-700 dark:text-gray-300" /> 
            Calendário de calor
          </h3>

          <div className="flex-1">
            <HeatMap endDate={endDate} onDateSelect={(date) => { setStartDate(date); setEndDate(date); }} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-6">
        {/* Origem e Conversão dos Leads por Canal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 transition-all flex flex-col"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Origem do Leads x Conversão (Canal)
          </h3>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={leadCombinedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  height={60}
                  tick={({ x, y, payload }) => {
                      const config = SOCIAL_MEDIA_CONFIG[payload.value] || SOCIAL_MEDIA_CONFIG['Outros'];
                      const Icon = config.icon;
                      return (
                          <g transform={`translate(${x},${y})`}>
                              <Icon x={-10} y={8} width={20} height={20} color={config.color} />
                              <text x={0} y={42} textAnchor="middle" fill={chartTheme.textColor} fontSize={11}>
                                  {payload.value}
                              </text>
                          </g>
                      );
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: chartTheme.textColor }} 
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <RechartsTooltip 
                    cursor={{ fill: isDark ? '#1f2937' : '#f9fafb' }} 
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div style={{
                                    backgroundColor: chartTheme.tooltipBg,
                                    border: `1px solid ${chartTheme.tooltipBorder}`,
                                    color: chartTheme.tooltipText,
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                }}>
                                    <p className="font-semibold mb-2">{label}</p>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between gap-4">
                                            <span style={{ color: '#3b82f6' }}>Leads:</span>
                                            <span className="font-medium">{data.leads.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span style={{ color: '#f59e0b' }}>Conversões:</span>
                                            <span className="font-medium">{data.conversions.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span style={{ color: '#10b981' }}>Taxa de Conversão:</span>
                                            <span className="font-medium">{data.conversionRate?.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="leads" name="Leads" radius={[6, 6, 0, 0]} barSize={30}>
                  {leadCombinedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SOCIAL_MEDIA_CONFIG[entry.name]?.color || '#6B7280'} />
                  ))}
                </Bar>
                <Line yAxisId="left" type="monotone" dataKey="conversions" name="Conversões" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Principais Horários */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 transition-all flex flex-col"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" /> Principais horários (Leads)
          </h3>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyLeadsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={11}
                  tick={{ fill: chartTheme.textColor }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={10} 
                  tick={{ fill: chartTheme.textColor }} 
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <RechartsTooltip 
                    cursor={{ fill: isDark ? '#1f2937' : '#f9fafb' }} 
                    contentStyle={{ 
                      backgroundColor: chartTheme.tooltipBg, 
                      borderColor: chartTheme.tooltipBorder, 
                      color: chartTheme.tooltipText,
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                        value.toLocaleString(), 
                        'Leads'
                    ]}
                />
                <Legend />
                <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]} barSize={24} fill="#10b981">
                  {hourlyLeadsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02, zIndex: 10 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 transition-all"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Evolução (7 Dias)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tickMargin={10} tick={{ fill: chartTheme.textColor }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: chartTheme.textColor }} />
                <RechartsTooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText }} />
                <Line type="monotone" dataKey="campaignA" stroke="#3B82F6" name="Top 1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="campaignB" stroke="#10B981" name="Top 2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="campaignC" stroke="#F59E0B" name="Top 3" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.005, zIndex: 10 }}
          className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 transition-all"
        >
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Cliques & Leads Diários
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mergedDailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} tickMargin={10} tick={{ fill: chartTheme.textColor }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: chartTheme.textColor }} />
                <RechartsTooltip 
                  cursor={{ fill: isDark ? '#1f2937' : '#f9fafb' }} 
                  contentStyle={{ 
                    backgroundColor: chartTheme.tooltipBg, 
                    borderColor: chartTheme.tooltipBorder, 
                    color: chartTheme.tooltipText,
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: 'none'
                  }} 
                />
                <Legend iconType="circle" />
                <Bar name="Cliques" dataKey="clicks" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                <Bar name="Leads" dataKey="leads" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,1fr] gap-4 my-6">
        {/* Mapa de Calor */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 overflow-hidden transition-all h-[400px] flex flex-col"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-blue-600" /> Mapa de Calor (Brasil)
              </h3>
          </div>
          <div className="flex-1 w-full relative z-0">
              <MapContainer 
                  center={[-14.2350, -51.9253]} 
                  zoom={3.5} 
                  style={{ height: '100%', width: '100%', background: '#111' }} 
                  zoomControl={false}
                  className="dashboard-map z-0 h-full w-full [&_.leaflet-tile-pane]:grayscale [&_.leaflet-tile-pane]:opacity-60 dark:[&_.leaflet-tile-pane]:opacity-40"
              >
                  <MapUpdater />
                  <TileLayer
                      url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                      attribution='&copy; Google Maps'
                  />
                  {mapPoints.map((p, idx) => (
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
                          <Popup closeButton={false}>
                              <div className="text-center min-w-[100px]">
                                  <h3 className="font-bold text-white text-sm mb-1">{p.name}</h3>
                                  <div className="flex items-center justify-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${p.type === 'WhatsApp' ? 'bg-green-500' : 'bg-blue-500'} shadow-[0_0_5px_currentColor]`}></div>
                                      <span className="font-black text-blue-400 text-lg leading-none">{p.count}</span>
                                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Leads</span>
                                  </div>
                              </div>
                          </Popup>
                      </CircleMarker>
                  ))}
              </MapContainer>
          </div>
        </motion.div>

        {/* Melhores Campanhas */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 overflow-hidden transition-all h-[400px] flex flex-col"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" /> Melhores Campanhas
                </h3>
            </div>
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                        <th className="p-4 font-bold">Criativo</th>
                        <th className="p-4 font-bold">Campanha</th>
                        <th className="p-4 font-bold text-center">Score</th>
                        <th className="p-4 font-bold text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-zinc-900 font-medium">
                    {topCampaigns.map((campaign) => (
                        <tr 
                          key={campaign.id} 
                          onClick={() => handleOpenDetails(campaign)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        >
                        <td className="p-4"><img src={campaign.imageUrl} alt="Creative" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" /></td>
                        <td className="p-4">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs truncate max-w-[150px]">{campaign.name}</p>
                            <p className="text-blue-500 font-mono text-[9px] truncate max-w-[120px]">{campaign.shortUrl}</p>
                        </td>
                        <td className="p-4 text-center"><span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1 px-2 rounded-full text-[10px] font-black">{(campaign.score || 0).toLocaleString()}</span></td>
                        <td className="p-4 text-right"><button onClick={(e) => { e.stopPropagation(); handleOpenDetails(campaign); }} className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors font-bold text-[10px] uppercase tracking-widest"><Info className="w-3 h-3" /> Ver</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.01, zIndex: 10 }}
          className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-sm border border-gray-100 dark:border-zinc-900 overflow-hidden transition-all h-[400px] flex flex-col"
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Leads Recentes
            </h3>
            <button onClick={() => navigate('/leads')} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Ver Todos</button>
          </div>
          <div className="flex flex-col gap-1 p-2 overflow-y-auto custom-scrollbar flex-1">
                {recentLeads.slice(0, 10).map((lead) => (
                  <div key={lead.id} onClick={() => { setSelectedLead(lead); setIsLeadModalOpen(true); }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs">
                        {(lead.data['Nome'] || lead.data['nome'] || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{lead.data['Nome'] || lead.data['nome'] || 'Sem nome'}</p>
                        <p className="text-gray-500 font-medium text-[10px] truncate">{lead.data['Email'] || lead.data['email'] || 'Sem email'}</p>
                      </div>
                      <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                  </div>
                ))}
          </div>
        </motion.div>
      </div>



      {isModalOpen && selectedCampaign && (
        <CampaignModal 
          campaign={selectedCampaign} 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {isLeadModalOpen && selectedLead && (
        <LeadModal 
          lead={selectedLead} 
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
