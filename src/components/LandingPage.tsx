
import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowRight, BarChart2, QrCode, Share2, Activity, Globe, 
  Zap, Shield, Target, MousePointer2, ChevronRight, Play
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import GlobeGL from 'globe.gl';
import { Logo } from './Logo';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

// Mock Data for Landing Page Charts
const CHART_DATA = [
  { name: 'Seg', clicks: 2400, leads: 120 },
  { name: 'Ter', clicks: 3600, leads: 280 },
  { name: 'Qua', clicks: 2800, leads: 200 },
  { name: 'Qui', clicks: 4200, leads: 350 },
  { name: 'Sex', clicks: 5100, leads: 480 },
  { name: 'Sáb', clicks: 6800, leads: 520 },
  { name: 'Dom', clicks: 7400, leads: 610 },
];

const SOURCE_DATA = [
  { name: 'Instagram', value: 45 },
  { name: 'Facebook', value: 30 },
  { name: 'TikTok', value: 15 },
  { name: 'Google', value: 10 },
];

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (!globeRef.current) return;

    // Dados fictícios para o globo da Landing Page
    const arcsData = [
      { startLat: -23.5505, startLng: -46.6333, endLat: 40.7128, endLng: -74.0060, color: ['#3b82f6', '#06b6d4'] }, // SP -> NY
      { startLat: -23.5505, startLng: -46.6333, endLat: 38.7223, endLng: -9.1393, color: ['#3b82f6', '#a855f7'] }, // SP -> Lisboa
      { startLat: 51.5074, startLng: -0.1278, endLat: 35.6762, endLng: 139.6503, color: ['#06b6d4', '#22c55e'] }, // Londres -> Toquio
      { startLat: 40.7128, startLng: -74.0060, endLat: 34.0522, endLng: -118.2437, color: ['#a855f7', '#f472b6'] }, // NY -> LA
      { startLat: -23.5505, startLng: -46.6333, endLat: -33.8688, endLng: 151.2093, color: ['#3b82f6', '#f59e0b'] }, // SP -> Sydney
    ];

    const ringsData = [
      { lat: -23.5505, lng: -46.6333, maxR: 8, propagationSpeed: 4, repeatPeriod: 800, color: '#3b82f6' }, // SP
      { lat: 40.7128, lng: -74.0060, maxR: 6, propagationSpeed: 3, repeatPeriod: 1000, color: '#06b6d4' }, // NY
      { lat: 38.7223, lng: -9.1393, maxR: 5, propagationSpeed: 3, repeatPeriod: 1200, color: '#a855f7' }, // Lisboa
      { lat: 35.6762, lng: 139.6503, maxR: 7, propagationSpeed: 5, repeatPeriod: 900, color: '#22c55e' }, // Toquio
    ];

    const world = (GlobeGL as any)()(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)')
      .atmosphereColor('#3B82F6')
      .atmosphereAltitude(0.2)
      .width(globeRef.current.clientWidth)
      .height(globeRef.current.clientHeight)
      .arcsData(arcsData)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(2000)
      .arcStroke(1.5) // Aumentado para visibilidade
      .ringsData(ringsData)
      .ringColor((d: any) => (t: number) => `rgba(${parseInt(d.color.slice(1, 3), 16)},${parseInt(d.color.slice(3, 5), 16)},${parseInt(d.color.slice(5, 7), 16)},${1 - t})`)
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod');

    // Configurações de Câmera e Controles
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 1.2;
    world.controls().enableZoom = false; // Desabilita zoom para não quebrar layout
    world.pointOfView({ lat: 10, lng: -30, altitude: 2.2 }); // Vista inicial focada no Atlântico

    const timer = setTimeout(() => {
      setGlobeReady(true);
    }, 0);

    // Resize Handler
    const handleResize = () => {
      if (globeRef.current) {
        world.width(globeRef.current.clientWidth);
        world.height(globeRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030305] text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-8 text-white" />
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onLoginClick} className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </button>
            <button onClick={onRegisterClick} className="group relative px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-100 transition-all overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Começar Agora <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Novo: Rastreamento via WhatsApp</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Domine o Tráfego.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
              Controle o Resultado.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            A plataforma definitiva para gestores de tráfego e afiliados. Gere links inteligentes, QR Codes dinâmicos e visualize cada conversão em tempo real no nosso mapa global.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button onClick={onRegisterClick} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)] hover:scale-105 flex items-center justify-center gap-3">
              <Zap className="w-5 h-5 fill-current" /> Criar Conta Grátis
            </button>
            <button onClick={onLoginClick} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-3">
              <Play className="w-5 h-5 fill-current" /> Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="relative py-20 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-[#0B0E14] border border-white/10 rounded-[32px] p-2 md:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-300">
            {/* Glossy Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            {/* Header Mockup */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-gray-400 font-mono">
                dashboard.adstrack.com
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-[#151921] rounded-2xl p-6 border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Performance Semanal</h3>
                    <p className="text-2xl font-bold text-white mt-1">7,400 <span className="text-sm text-green-400 font-normal">+12%</span></p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><BarChart2 className="w-4 h-4" /></div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Cards */}
              <div className="space-y-6">
                {/* KPI 1 */}
                <div className="bg-[#151921] rounded-2xl p-6 border border-white/5 hover:border-blue-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                      <MousePointer2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded">ATIVO</span>
                  </div>
                  <p className="text-gray-400 text-sm uppercase font-bold tracking-widest">Leads Hoje</p>
                  <p className="text-4xl font-black text-white mt-2">482</p>
                </div>

                {/* KPI 2 */}
                <div className="bg-[#151921] rounded-2xl p-6 border border-white/5 hover:border-purple-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <QrCode className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm uppercase font-bold tracking-widest">QR Scans</p>
                  <p className="text-4xl font-black text-white mt-2">1,205</p>
                </div>

                {/* Mini List */}
                <div className="bg-[#151921] rounded-2xl p-6 border border-white/5">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Top Fontes</h4>
                   <div className="space-y-3">
                      {SOURCE_DATA.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                           <span className="text-gray-300 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500" /> {source.name}
                           </span>
                           <span className="text-white font-bold">{source.value}%</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Map Simulation Section - Now with Real 3D Globe */}
      <section className="py-24 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Globe className="w-3 h-3" /> Global Tracking
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">Rastreamento Geográfico em <span className="text-blue-500">Tempo Real</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Saiba exatamente de onde vêm seus cliques. Nossa tecnologia de geolocalização mapeia cidades, estados e dispositivos instantaneamente.
              </p>

              <div className="space-y-4">
                {[
                  { city: "São Paulo, BR", time: "Agora", device: "iPhone 14", value: "R$ 150,00" },
                  { city: "Lisboa, PT", time: "2 min atrás", device: "Desktop Chrome", value: "€ 45,00" },
                  { city: "Nova York, US", time: "5 min atrás", device: "Android", value: "$ 30.00" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{item.city}</p>
                      <p className="text-gray-500 text-xs">{item.device} • {item.time}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-green-400 font-bold text-sm">Nova Venda</p>
                       <p className="text-white text-xs opacity-60">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real 3D Globe Visual */}
            <div className="relative h-[500px] w-full flex items-center justify-center">
               <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] relative z-0">
                   <div 
                      ref={globeRef} 
                      className="w-full h-full cursor-move rounded-full overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.2)] border border-white/5 bg-black" 
                   />
               </div>
               
               {!globeReady && (
                 <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-[#030305]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-black mb-4">Ferramentas de <span className="text-cyan-400">Elite</span></h2>
             <p className="text-gray-400">Tudo o que você precisa para escalar suas campanhas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Share2, title: "Link Management", desc: "Encurtador próprio, domínios personalizados e organização por pastas UTM automáticas.", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Shield, title: "Proteção de Bot", desc: "Filtramos tráfego inválido para garantir que seus dados de conversão sejam 100% reais.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
              { icon: BarChart2, title: "Analytics Profundo", desc: "Métricas de dispositivo, sistema operacional, navegador e hora do dia.", color: "text-purple-400", bg: "bg-purple-500/10" }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#0B0E14] border border-white/5 hover:border-white/10 transition-all hover:-translate-y-2 group">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030305] via-transparent to-[#030305]" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            Pronto para <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Escalar sua Operação?</span>
          </h2>
          <div className="flex justify-center gap-6">
             <button onClick={onRegisterClick} className="px-10 py-5 bg-white text-black rounded-full font-black text-lg hover:bg-gray-200 transition-colors shadow-2xl shadow-white/10 flex items-center gap-2">
                Começar Agora <ChevronRight className="w-5 h-5" />
             </button>
          </div>
          <p className="mt-8 text-gray-500 text-sm font-medium">Não requer cartão de crédito • 14 dias grátis</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <Logo className="h-6 text-white" />
          </div>
          <p className="text-gray-500 text-sm">© 2024 AdsTrack Inc. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
