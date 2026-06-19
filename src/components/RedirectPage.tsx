
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campaign, FormField } from '../types';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../constants';
import { triggerWebhook } from '../services/webhookService';
import { Logo } from './Logo';

const RedirectPage: React.FC = () => {
  const { shortCode } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        // MOCK MODE
        if (!isSupabaseConfigured) {
            // Tenta encontrar nos dados mockados (extraindo o código do shortUrl mockado)
            const mockCamp = MOCK_CAMPAIGNS.find(c => c.shortUrl.includes(shortCode || ''));
            
            if (mockCamp) {
                setCampaign(mockCamp);
                if (!mockCamp.formConfig) {
                    setTimeout(() => {
                        window.location.href = mockCamp.originalUrl;
                    }, 1000);
                } else {
                    setLoading(false);
                }
                return;
            }
            
            // Se não encontrar, pega o primeiro para demonstração
            if (MOCK_CAMPAIGNS.length > 0) {
               const fallback = MOCK_CAMPAIGNS[0];
               setCampaign(fallback);
               if (!fallback.formConfig) {
                   setTimeout(() => { window.location.href = fallback.originalUrl; }, 1000);
               } else {
                   setLoading(false);
               }
               return;
            }
            
            throw new Error('Campanha não encontrada (Modo Demo).');
        }

        // REAL MODE
        const { data, error } = await supabase
          .from('campaigns')
          .select('*, profiles(company_logo_url, company_name)')
          .eq('short_code', shortCode)
          .single();

        if (error || !data) throw new Error('Campanha não encontrada.');
        
        const camp: Campaign = {
          id: data.id,
          name: data.name,
          originalUrl: data.original_url,
          shortUrl: data.short_code,
          clicks: data.clicks_count,
          imageUrl: data.creative_url,
          createdAt: data.created_at,
          qrCodeUrl: data.qr_code,
          utm: {
            source: data.utm_source,
            medium: data.utm_medium,
            campaign: data.utm_campaign,
            content: data.utm_content
          },
          creativeName: data.utm_content,
          adSetName: data.utm_medium,
          formConfig: data.form_config,
          // Adicionando informações da marca
          brandLogo: data.profiles?.company_logo_url,
          brandName: data.profiles?.company_name
        };

        setCampaign(camp);

        if (!camp.formConfig) {
          await recordClick(camp.id);
          window.location.href = camp.originalUrl;
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (shortCode) fetchCampaign();
  }, [shortCode]);

  const recordClick = async (campaignId: string) => {
    if (!isSupabaseConfigured) return;

    try {
      // Tenta obter geolocalização via IP (Serviço Robusto: ip-api.com)
      let geo: { city: string; state: string; lat: number | null; lng: number | null; ip: string } = { city: 'Desconhecido', state: '??', lat: null, lng: null, ip: '0.0.0.0' };
      try {
        const res = await fetch('http://ip-api.com/json/?fields=status,message,country,region,regionName,city,lat,lon,query');
        const data = await res.json();
        if (data.status === 'success') {
          geo = { 
            city: data.city, 
            state: data.region, // UF do estado (ex: SP)
            lat: data.lat, 
            lng: data.lon,
            ip: data.query
          };
        }
      } catch (e) {
        console.warn('Erro ao identificar localização por IP:', e);
      }

      // Salva o clique utilizando a coluna 'location_state' solicitada
      const { error: insertError } = await supabase.from('clicks').insert([{
        campaign_id: campaignId,
        ip_address: geo.ip, 
        user_agent: navigator.userAgent,
        city: geo.city,
        state: geo.state,
        location_state: geo.state, // Coluna alvo para o mapa
        lat: geo.lat?.toString(),
        lng: geo.lng?.toString()
      }]);

      if (insertError) {
        console.error('Erro ao registrar clique:', insertError.message);
      }

      await supabase.rpc('increment_clicks', { row_id: campaignId });
    } catch (err) {
      console.error('Erro crítico no tracking:', err);
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (!campaign?.formConfig) return;
    const currentField = campaign.formConfig.fields[currentStep];
    if (currentField.required && !formValues[currentField.label]) {
      alert("Por favor, preencha este campo.");
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setLoading(true);
    
    if (!isSupabaseConfigured) {
        setTimeout(() => {
            setSubmitted(true);
            setTimeout(() => {
                window.location.href = campaign.originalUrl;
            }, 1500);
        }, 1000);
        return;
    }

    try {
      // Trigger Webhook
      await triggerWebhook({
        id: `lead-${Math.random().toString(36).substr(2, 9)}`,
        ...formValues,
        source: campaign.utm.source || 'AdsTrack',
        campaign: campaign.name,
        medium: campaign.utm.medium || 'Direct',
        content: campaign.utm.content || 'None',
        created_at: new Date().toISOString()
      });

      if (isSupabaseConfigured) {
        await supabase.from('form_responses').insert([{
          campaign_id: campaign.id,
          data: formValues,
          utm_context: campaign.utm
        }]);

        await recordClick(campaign.id);
      }

      if (campaign.formConfig?.pixelId) {
        // Disparo do pixel aqui
      }

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = campaign.originalUrl;
      }, 1500);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Identificando localização...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center font-sans">
        <div className="bg-red-50 text-red-600 p-8 rounded-[32px] border border-red-100 max-w-sm">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Erro</h2>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black p-6 text-center font-sans animate-in zoom-in">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Dados Enviados!</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Redirecionando para o WhatsApp...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-white dark:bg-gray-900 rounded-[40px] w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8">
        
        {campaign?.imageUrl && (
          <div className="relative h-48 sm:h-64 bg-gray-100">
            <img src={campaign.imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-8 sm:p-12">
          <div className="mb-10 text-center flex flex-col items-center">
            {campaign?.brandLogo ? (
              <img src={campaign.brandLogo} alt={campaign.brandName || 'Logo'} className="h-12 object-contain mb-6" />
            ) : (
              <Logo className="h-10 text-blue-600 dark:text-white mb-6" />
            )}
            
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              {campaign?.formConfig?.title || 'Quase pronto!'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {campaign?.formConfig?.description || 'Preencha os dados abaixo para continuar.'}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {campaign?.formConfig?.fields.length && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
                {(() => {
                  const field = campaign.formConfig.fields[currentStep];
                  return (
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'long_text' ? (
                        <textarea
                          value={formValues[field.label] || ''}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          rows={3}
                          required={field.required}
                        />
                      ) : field.type === 'multiple_choice' || field.type === 'dropdown' ? (
                        <select
                          value={formValues[field.label] || ''}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                          required={field.required}
                        >
                          <option value="">Selecione...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <div className="space-y-3">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                              <input 
                                type="checkbox"
                                checked={(formValues[field.label] || []).includes(opt)}
                                onChange={(e) => {
                                  const current = formValues[field.label] || [];
                                  const next = e.target.checked ? [...current, opt] : current.filter((v: string) => v !== opt);
                                  handleInputChange(field.label, next);
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={formValues[field.label] || ''}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          required={field.required}
                        />
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-3 pt-6">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-gray-200"
                    >
                      Voltar
                    </button>
                  )}

                  {currentStep < (campaign?.formConfig?.fields.length || 0) - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> {campaign?.formConfig?.submitButtonText || 'Continuar'}</>}
                    </button>
                  )}
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 pt-4">
                  {campaign?.formConfig?.fields.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all ${idx === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-800'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="mt-12 text-center">
            <p className="text-[9px] text-gray-300 dark:text-gray-600 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-gray-100 dark:bg-gray-800" />
              Protegido por AdsTrack
              <span className="w-8 h-[1px] bg-gray-100 dark:bg-gray-800" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
