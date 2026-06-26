
export interface UtmParameters {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term?: string;
}

export type FieldType = 
  | 'text' 
  | 'long_text' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'date' 
  | 'multiple_choice' 
  | 'checkbox' 
  | 'dropdown';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // Para campos de rádio, checkbox e select
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText: string;
  pixelId?: string; 
}

export interface FormResponse {
  id: string;
  campaign_id: string;
  data: Record<string, any>;
  utm_context: UtmParameters; // Rastreamento completo no lead
  creative_context: {
    name: string;
    image_url: string;
  };
  created_at: string;
  mock_form_response?: Record<string, any> | null;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Novo' | 'Contatado' | 'Convertido' | 'Perdido';
  source: string;
  campaign: string;
  created_at: string;
  score: number;
}

export type LeadQualification = 'FRIO' | 'MORNO' | 'QUENTE';

export interface Campaign {
  id: string;
  user_id?: string;
  name: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  salesCount?: number;
  leadQualification?: LeadQualification;
  imageUrl: string;
  createdAt: string;
  qrCodeUrl: string;
  utm: UtmParameters;
  creativeName: string;
  adSetName: string;
  status?: 'active' | 'inactive';
  dailyClicks?: number; 
  weeklyClicks?: number; 
  value?: number;
  score?: number;
  formConfig?: FormConfig;
}

export interface WhatsappContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  company_name: string;
  company_logo_url: string;
  role: string;
  invitation_code: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  image?: string;
  date?: string;
}

export interface DailyClickData {
  day: string;
  clicks: number;
}

export interface DailyLeadData {
  day: string;
  leads: number;
}

export interface EvolutionData {
  date: string;
  campaignA: number;
  campaignB: number;
  campaignC: number;
}

export interface StateData {
  id: string;
  name: string;
  clicks: number;
  topCreativeUrl: string;
}

export interface CityData {
  name: string;
  state: string;
  clicks: number;
  topCreativeName?: string;
  topCreativeUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SvgPath {
  id: string;
  name: string;
  path: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  campaignsCount: number;
  clicksCount: number;
  joinedAt: string;
  avatar: string;
}

// Tipos para Facebook Integration
export interface FacebookAdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
}

export interface FacebookInsight {
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  impressions: string;
  clicks: string;
  spend: string;
  cpc?: string;
  ctr?: string;
  actions?: any[];
}

export interface FacebookCampaign {
  id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
  insights?: FacebookInsight; // Dados acoplados
}

export interface FacebookAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  targeting?: any;
  billing_event?: string;
  daily_budget?: string;
  insights?: FacebookInsight;
}

export interface FacebookAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  creative?: {
    id: string;
    thumbnail_url?: string;
    image_url?: string; // Campo enriquecido
  };
  insights?: FacebookInsight;
}

// Instagram Types
export interface InstagramInsightData {
  date: string;
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
}

export interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  biography?: string;
  is_own: boolean;
  engagement_rate: number;
  history: InstagramInsightData[];
}
