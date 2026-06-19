
import { Campaign, ChartDataPoint, DailyClickData, EvolutionData, StateData, CityData, SvgPath, AdminUser } from './types';

export const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
  'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
  'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
  'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
  'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
  'SE': 'Sergipe', 'TO': 'Tocantins'
};

export const BRAZIL_COORDS: Record<string, { lat: number, lng: number }> = {
  'AC': { lat: -9.02, lng: -70.81 },
  'AL': { lat: -9.57, lng: -36.78 },
  'AP': { lat: 1.41, lng: -51.77 },
  'AM': { lat: -3.41, lng: -64.44 },
  'BA': { lat: -12.96, lng: -41.70 },
  'CE': { lat: -5.20, lng: -39.53 },
  'DF': { lat: -15.78, lng: -47.93 },
  'ES': { lat: -19.19, lng: -40.34 },
  'GO': { lat: -15.82, lng: -49.83 },
  'MA': { lat: -4.96, lng: -45.27 },
  'MT': { lat: -12.64, lng: -55.42 },
  'MS': { lat: -20.77, lng: -54.78 },
  'MG': { lat: -18.51, lng: -44.55 },
  'PA': { lat: -3.79, lng: -52.48 },
  'PB': { lat: -7.24, lng: -36.78 },
  'PR': { lat: -24.89, lng: -51.55 },
  'PE': { lat: -8.28, lng: -37.92 },
  'PI': { lat: -7.71, lng: -42.72 },
  'RJ': { lat: -22.44, lng: -42.99 },
  'RN': { lat: -5.40, lng: -36.95 },
  'RS': { lat: -30.01, lng: -53.53 },
  'RO': { lat: -10.83, lng: -63.34 },
  'RR': { lat: 1.89, lng: -61.22 },
  'SC': { lat: -27.24, lng: -50.21 },
  'SP': { lat: -22.25, lng: -48.39 },
  'SE': { lat: -10.57, lng: -37.45 },
  'TO': { lat: -10.17, lng: -48.33 }
};

export const MOCK_LOCATION_DATA = [
  { state: 'SP', count: 18500 },
  { state: 'RJ', count: 11200 },
  { state: 'MG', count: 8900 },
  { state: 'RS', count: 6500 },
  { state: 'PR', count: 5400 },
  { state: 'BA', count: 4200 },
  { state: 'DF', count: 3800 },
  { state: 'SC', count: 3100 },
  { state: 'PE', count: 2900 },
  { state: 'CE', count: 2500 },
  { state: 'GO', count: 2100 },
  { state: 'ES', count: 1800 },
  { state: 'AM', count: 1500 },
  { state: 'PA', count: 1200 },
  { state: 'MT', count: 950 },
  { state: 'MS', count: 800 },
  { state: 'RN', count: 750 },
  { state: 'PB', count: 600 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'CP FORMULÁRIO LEADS ENGAJAMENTO WA BM2',
    originalUrl: 'https://api.whatsapp.com/send/?phone=5513997438073&text=Olá',
    shortUrl: 'app.adstrack.com.br/r/cp-formulario-leads*-pxnqj',
    clicks: 19,
    salesCount: 0,
    leadQualification: 'FRIO',
    imageUrl: 'https://picsum.photos/400/225?random=1',
    createdAt: new Date().toISOString(),
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://api.whatsapp.com/send/?phone=5513997438073',
    utm: { source: 'Facebook', medium: '[CJ 01] [PUBLICO ABERTO]', campaign: 'CP FORMULÁRIO LEADS ENGAJAMENTO WA BM2', content: 'CT RESPONDER 24H' },
    creativeName: 'Video Engajamento WA',
    adSetName: 'Publico Aberto',
    status: 'active',
    dailyClicks: 19,
    weeklyClicks: 19,
    value: 0.00,
    score: 15
  },
  {
    id: '2',
    name: 'Promoção Black Friday',
    originalUrl: 'https://myshop.com/bf?utm_source=instagram',
    shortUrl: 'ltrk.io/blkfr',
    clicks: 3420,
    salesCount: 12,
    leadQualification: 'QUENTE',
    imageUrl: 'https://picsum.photos/200/200?random=2',
    createdAt: '2023-11-01T08:30:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://myshop.com/bf',
    utm: { source: 'instagram', medium: 'story', campaign: 'black_friday', content: 'banner_static_red' },
    creativeName: 'Banner Vermelho',
    adSetName: 'Lookalike 1%',
    status: 'active',
    dailyClicks: 150, // Performando (> 100)
    weeklyClicks: 300, // Performando (> 200)
    value: 3420.50,
    score: 82
  },
  {
    id: '3',
    name: 'Webinar de Investimentos',
    originalUrl: 'https://finance.com/webinar?utm_source=linkedin',
    shortUrl: 'ltrk.io/invwb',
    clicks: 850,
    salesCount: 5,
    leadQualification: 'MORNO',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    createdAt: '2023-11-05T14:15:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://finance.com/webinar',
    utm: { source: 'linkedin', medium: 'post', campaign: 'webinar_q4', content: 'text_only' },
    creativeName: 'Texto Longo',
    adSetName: 'Profissionais Financeiros',
    status: 'inactive', // Desativado
    dailyClicks: 0,
    weeklyClicks: 0,
    value: 0.00,
    score: 35
  },
  {
    id: '4',
    name: 'E-book Grátis',
    originalUrl: 'https://blog.com/ebook?utm_source=email',
    shortUrl: 'ltrk.io/ebook',
    clicks: 2100,
    salesCount: 0,
    leadQualification: 'FRIO',
    imageUrl: 'https://picsum.photos/200/200?random=4',
    createdAt: '2023-10-15T09:00:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://blog.com/ebook',
    utm: { source: 'email_marketing', medium: 'newsletter', campaign: 'ebook_lead_gen', content: 'button_cta' },
    creativeName: 'Capa Azul 3D',
    adSetName: 'Lista Quente',
    status: 'active',
    dailyClicks: 45, // Baixa Performance (< 100)
    weeklyClicks: 120,
    value: 500.00,
    score: 55
  },
  {
    id: '5',
    name: 'Desafio 30 Dias',
    originalUrl: 'https://fitness.com/challenge?utm_source=tiktok',
    shortUrl: 'ltrk.io/fit30',
    clicks: 5600,
    salesCount: 45,
    leadQualification: 'QUENTE',
    imageUrl: 'https://picsum.photos/200/200?random=5',
    createdAt: '2023-11-10T18:45:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://fitness.com/challenge',
    utm: { source: 'tiktok', medium: 'video', campaign: 'challenge_nov', content: 'influencer_dance' },
    creativeName: 'Dança Viral',
    adSetName: 'Aberto Brasil',
    status: 'active',
    dailyClicks: 250, // Alta Performance (> 200)
    weeklyClicks: 600, // Alta Performance (> 500)
    value: 15000.00,
    score: 95
  }
];

export const PIE_CHART_DATA: ChartDataPoint[] = [
  { name: 'Lançamento Verão', value: 1250, image: 'https://picsum.photos/200/200?random=1' },
  { name: 'Black Friday', value: 3420, image: 'https://picsum.photos/200/200?random=2' },
  { name: 'Webinar', value: 850, image: 'https://picsum.photos/200/200?random=3' },
  { name: 'E-book', value: 2100, image: 'https://picsum.photos/200/200?random=4' },
  { name: 'Desafio 30 Dias', value: 5600, image: 'https://picsum.photos/200/200?random=5' },
];

export const EVOLUTION_DATA: EvolutionData[] = [
  { date: '01/11', campaignA: 120, campaignB: 80, campaignC: 200 },
  { date: '02/11', campaignA: 132, campaignB: 90, campaignC: 210 },
  { date: '03/11', campaignA: 101, campaignB: 120, campaignC: 250 },
  { date: '04/11', campaignA: 134, campaignB: 110, campaignC: 280 },
  { date: '05/11', campaignA: 190, campaignB: 130, campaignC: 320 },
  { date: '06/11', campaignA: 230, campaignB: 140, campaignC: 400 },
  { date: '07/11', campaignA: 210, campaignB: 160, campaignC: 380 },
];

export const DAILY_CLICKS: DailyClickData[] = [
  { day: 'Seg', clicks: 1200 },
  { day: 'Ter', clicks: 1500 },
  { day: 'Qua', clicks: 1100 },
  { day: 'Qui', clicks: 1800 },
  { day: 'Sex', clicks: 2000 },
  { day: 'Sáb', clicks: 2400 },
  { day: 'Dom', clicks: 2100 },
];

export const TOP_CREATIVES: ChartDataPoint[] = [
  { name: 'Vídeo Viral #1', value: 4500 },
  { name: 'Banner Estático', value: 3200 },
  { name: 'Carrossel Dicas', value: 2800 },
  { name: 'Stories Enquete', value: 1500 },
  { name: 'Reels Trends', value: 1200 },
];

export const TOP_SETS: ChartDataPoint[] = [
  { name: 'Interesse Tecnologia', value: 5000 },
  { name: 'Lookalike Compradores', value: 4200 },
  { name: 'Aberto 18-35', value: 3000 },
  { name: 'Remarketing 30D', value: 2500 },
  { name: 'Lista VIP', value: 1800 },
];

export const LOCATION_STATS: StateData[] = [
  { id: 'AC', name: 'Acre', clicks: 1200, topCreativeUrl: 'https://picsum.photos/200/200?random=11' },
  { id: 'AL', name: 'Alagoas', clicks: 2300, topCreativeUrl: 'https://picsum.photos/200/200?random=12' },
  { id: 'AP', name: 'Amapá', clicks: 900, topCreativeUrl: 'https://picsum.photos/200/200?random=13' },
  { id: 'AM', name: 'Amazonas', clicks: 3100, topCreativeUrl: 'https://picsum.photos/200/200?random=14' },
  { id: 'BA', name: 'Bahia', clicks: 8400, topCreativeUrl: 'https://picsum.photos/200/200?random=15' },
  { id: 'CE', name: 'Ceará', clicks: 5600, topCreativeUrl: 'https://picsum.photos/200/200?random=16' },
  { id: 'DF', name: 'Distrito Federal', clicks: 7200, topCreativeUrl: 'https://picsum.photos/200/200?random=17' },
  { id: 'ES', name: 'Espírito Santo', clicks: 4100, topCreativeUrl: 'https://picsum.photos/200/200?random=18' },
  { id: 'GO', name: 'Goiás', clicks: 5300, topCreativeUrl: 'https://picsum.photos/200/200?random=19' },
  { id: 'MA', name: 'Maranhão', clicks: 3400, topCreativeUrl: 'https://picsum.photos/200/200?random=20' },
  { id: 'MT', name: 'Mato Grosso', clicks: 4500, topCreativeUrl: 'https://picsum.photos/200/200?random=21' },
  { id: 'MS', name: 'Mato Grosso do Sul', clicks: 3800, topCreativeUrl: 'https://picsum.photos/200/200?random=22' },
  { id: 'MG', name: 'Minas Gerais', clicks: 12500, topCreativeUrl: 'https://picsum.photos/200/200?random=23' },
  { id: 'PA', name: 'Pará', clicks: 4200, topCreativeUrl: 'https://picsum.photos/200/200?random=24' },
  { id: 'PB', name: 'Paraíba', clicks: 2800, topCreativeUrl: 'https://picsum.photos/200/200?random=25' },
  { id: 'PR', name: 'Paraná', clicks: 9500, topCreativeUrl: 'https://picsum.photos/200/200?random=26' },
  { id: 'PE', name: 'Pernambuco', clicks: 5900, topCreativeUrl: 'https://picsum.photos/200/200?random=27' },
  { id: 'PI', name: 'Piauí', clicks: 2100, topCreativeUrl: 'https://picsum.photos/200/200?random=28' },
  { id: 'RJ', name: 'Rio de Janeiro', clicks: 15400, topCreativeUrl: 'https://picsum.photos/200/200?random=29' },
  { id: 'RN', name: 'Rio Grande do Norte', clicks: 2600, topCreativeUrl: 'https://picsum.photos/200/200?random=30' },
  { id: 'RS', name: 'Rio Grande do Sul', clicks: 10200, topCreativeUrl: 'https://picsum.photos/200/200?random=31' },
  { id: 'RO', name: 'Rondônia', clicks: 1800, topCreativeUrl: 'https://picsum.photos/200/200?random=32' },
  { id: 'RR', name: 'Roraima', clicks: 750, topCreativeUrl: 'https://picsum.photos/200/200?random=33' },
  { id: 'SC', name: 'Santa Catarina', clicks: 8900, topCreativeUrl: 'https://picsum.photos/200/200?random=34' },
  { id: 'SP', name: 'São Paulo', clicks: 28500, topCreativeUrl: 'https://picsum.photos/200/200?random=35' },
  { id: 'SE', name: 'Sergipe', clicks: 1900, topCreativeUrl: 'https://picsum.photos/200/200?random=36' },
  { id: 'TO', name: 'Tocantins', clicks: 1400, topCreativeUrl: 'https://picsum.photos/200/200?random=37' }
];

export const TOP_STATES_DATA: ChartDataPoint[] = [
  { name: 'São Paulo', value: 28500 },
  { name: 'Rio de Janeiro', value: 15400 },
  { name: 'Minas Gerais', value: 12500 },
  { name: 'Rio Grande do Sul', value: 10200 },
  { name: 'Paraná', value: 9500 },
];

export const TOP_CITIES_DATA: CityData[] = [
  { 
    name: 'São Paulo', 
    state: 'SP', 
    clicks: 18500, 
    coordinates: { lat: -23.5505, lng: -46.6333 },
    topCreativeName: 'Vídeo Viral #1',
    topCreativeUrl: 'https://picsum.photos/200/200?random=35'
  },
  { 
    name: 'Rio de Janeiro', 
    state: 'RJ', 
    clicks: 11200, 
    coordinates: { lat: -22.9068, lng: -43.1729 },
    topCreativeName: 'Banner Verão',
    topCreativeUrl: 'https://picsum.photos/200/200?random=29'
  },
  { 
    name: 'Belo Horizonte', 
    state: 'MG', 
    clicks: 6800, 
    coordinates: { lat: -19.9167, lng: -43.9345 },
    topCreativeName: 'Stories Enquete',
    topCreativeUrl: 'https://picsum.photos/200/200?random=23'
  },
  { 
    name: 'Curitiba', 
    state: 'PR', 
    clicks: 5400, 
    coordinates: { lat: -25.4284, lng: -49.2733 },
    topCreativeName: 'Carrossel Dicas',
    topCreativeUrl: 'https://picsum.photos/200/200?random=26'
  },
  { 
    name: 'Brasília', 
    state: 'DF', 
    clicks: 5100, 
    coordinates: { lat: -15.7975, lng: -47.8919 },
    topCreativeName: 'Reels Trends',
    topCreativeUrl: 'https://picsum.photos/200/200?random=17'
  },
];

export const MAP_CITIES_DATA: CityData[] = [
    ...TOP_CITIES_DATA,
    { name: 'Salvador', state: 'BA', clicks: 4500, coordinates: { lat: -12.9777, lng: -38.5016 }, topCreativeName: 'Axé Vibe' },
    { name: 'Fortaleza', state: 'CE', clicks: 3800, coordinates: { lat: -3.7172, lng: -38.5434 }, topCreativeName: 'Sol e Mar' },
    { name: 'Manaus', state: 'AM', clicks: 3200, coordinates: { lat: -3.1190, lng: -60.0217 }, topCreativeName: 'Natureza' },
    { name: 'Recife', state: 'PE', clicks: 2900, coordinates: { lat: -8.0476, lng: -34.8770 }, topCreativeName: 'Frevo' },
    { name: 'Porto Alegre', state: 'RS', clicks: 2800, coordinates: { lat: -30.0346, lng: -51.2177 }, topCreativeName: 'Inverno' },
    { name: 'Belém', state: 'PA', clicks: 2100, coordinates: { lat: -1.4558, lng: -48.4902 }, topCreativeName: 'Açaí' },
    { name: 'Goiânia', state: 'GO', clicks: 1900, coordinates: { lat: -16.6869, lng: -49.2648 }, topCreativeName: 'Sertanejo' },
    { name: 'Florianópolis', state: 'SC', clicks: 1700, coordinates: { lat: -27.5954, lng: -48.5480 }, topCreativeName: 'Ilha Magia' },
    { name: 'Vitória', state: 'ES', clicks: 1500, coordinates: { lat: -20.3155, lng: -40.3128 }, topCreativeName: 'Moqueca' },
    { name: 'Natal', state: 'RN', clicks: 1200, coordinates: { lat: -5.7945, lng: -35.2110 }, topCreativeName: 'Dunas' },
    { name: 'Cuiabá', state: 'MT', clicks: 1100, coordinates: { lat: -15.6014, lng: -56.0979 }, topCreativeName: 'Pantanal' },
    { name: 'Campo Grande', state: 'MS', clicks: 950, coordinates: { lat: -20.4697, lng: -54.6201 }, topCreativeName: 'Agro' },
    { name: 'São Luís', state: 'MA', clicks: 800, coordinates: { lat: -2.5307, lng: -44.3068 }, topCreativeName: 'Lençóis' },
    { name: 'Maceió', state: 'AL', clicks: 750, coordinates: { lat: -9.6663, lng: -35.7351 }, topCreativeName: 'Caribe BR' },
    { name: 'Teresina', state: 'PI', clicks: 600, coordinates: { lat: -5.0919, lng: -42.8034 }, topCreativeName: 'Sol' },
    { name: 'João Pessoa', state: 'PB', clicks: 550, coordinates: { lat: -7.1195, lng: -34.8450 }, topCreativeName: 'Ponta do Seixas' },
    { name: 'Aracaju', state: 'SE', clicks: 400, coordinates: { lat: -10.9472, lng: -37.0731 }, topCreativeName: 'Orla' },
    { name: 'Porto Velho', state: 'RO', clicks: 350, coordinates: { lat: -8.7612, lng: -63.9039 }, topCreativeName: 'Madeira' },
    { name: 'Palmas', state: 'TO', clicks: 300, coordinates: { lat: -10.2491, lng: -48.3243 }, topCreativeName: 'Jalapão' },
    { name: 'Rio Branco', state: 'AC', clicks: 250, coordinates: { lat: -9.9754, lng: -67.8105 }, topCreativeName: 'Amazônia' }
];

export const BRAZIL_STATE_PATHS: SvgPath[] = [];

// MOCK USERS for Admin Page
export const MOCK_USERS: AdminUser[] = [
  {
    id: '1',
    name: 'Rubens Ferreira',
    email: 'rubens.rfs7@gmail.com',
    role: 'Admin',
    status: 'Ativo',
    campaignsCount: 14,
    clicksCount: 8588,
    joinedAt: '2025-11-05',
    avatar: 'https://picsum.photos/40/40?random=101'
  },
  {
    id: '2',
    name: 'Felipe Jordan Alves dos Santos',
    email: 'fjordan.business1@gmail.com',
    role: 'Básico',
    status: 'Ativo',
    campaignsCount: 3,
    clicksCount: 601,
    joinedAt: '2025-11-27',
    avatar: 'https://picsum.photos/40/40?random=102'
  },
  {
    id: '3',
    name: 'Victor Campos',
    email: 'victor.portalconcursos@gmail.com',
    role: 'Básico',
    status: 'Ativo',
    campaignsCount: 1,
    clicksCount: 896,
    joinedAt: '2025-11-28',
    avatar: 'https://picsum.photos/40/40?random=103'
  },
  {
    id: '4',
    name: 'Delis Maciel',
    email: 'deliswmaciel@gmail.com',
    role: 'Básico',
    status: 'Ativo',
    campaignsCount: 4,
    clicksCount: 8,
    joinedAt: '2025-12-05',
    avatar: 'https://picsum.photos/40/40?random=104'
  },
  {
    id: '5',
    name: 'Daniel de Alencar',
    email: 'danieldbvalencar@yahoo.com.br',
    role: 'Básico',
    status: 'Ativo',
    campaignsCount: 0,
    clicksCount: 0,
    joinedAt: '2025-12-10',
    avatar: 'https://picsum.photos/40/40?random=105'
  }
];
