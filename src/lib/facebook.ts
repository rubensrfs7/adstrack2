
export class FacebookService {
  private accessToken: string | null = null;
  private apiVersion = 'v18.0';

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async fetchAPI(endpoint: string, method: string = 'GET', body: any = null) {
    // MOCK RESPONSE GENERATOR
    if (!this.accessToken) {
        console.log(`[Mock FB API] ${method} ${endpoint}`, body);
        return { id: 'mock_id_' + Math.random().toString(36).substr(2, 9), data: [] };
    }

    const url = `https://graph.facebook.com/${this.apiVersion}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    const urlWithToken = `${url}${url.includes('?') ? '&' : '?'}access_token=${this.accessToken}`;

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(urlWithToken, config);
    const json = await response.json();
    
    if (json.error) {
      console.error('FB API Error:', json.error);
      throw new Error(json.error.message);
    }
    
    return json;
  }

  private getAccountId(id: string) {
      if (!id) return '';
      return id.startsWith('act_') ? id : `act_${id}`;
  }

  async getAdAccounts() {
    return this.fetchAPI('/me/adaccounts?fields=id,name,currency,account_status');
  }

  async uploadImage(accountId: string, file: File): Promise<string> {
      return 'mock_image_hash_123';
  }

  async createCampaign(accountId: string, data: any) {
    return this.fetchAPI(`/${this.getAccountId(accountId)}/campaigns`, 'POST', {
        name: data.name,
        objective: data.objective,
        status: 'PAUSED',
        special_ad_categories: [], 
    });
  }

  async createAdSet(accountId: string, campaignId: string, data: any) {
      return this.fetchAPI(`/${this.getAccountId(accountId)}/adsets`, 'POST', { ...data, campaign_id: campaignId });
  }

  async createAdCreative(accountId: string, data: any) {
      return this.fetchAPI(`/${this.getAccountId(accountId)}/adcreatives`, 'POST', data);
  }

  async createAd(accountId: string, adSetId: string, creativeId: string, data: any) {
      return this.fetchAPI(`/${this.getAccountId(accountId)}/ads`, 'POST', { ...data, adset_id: adSetId, creative: { creative_id: creativeId } });
  }
  
  // MOCK DATA GENERATION WITH HIERARCHY
  async getFullAccountData(accountId: string) {
      // Se tiver token, tentaria buscar dados reais. Como é para simular BM:
      // Retorna estrutura: Campaign -> AdSets -> Ads com métricas acopladas
      
      const generateMetrics = (baseSpend: number) => {
          const impressions = Math.floor(baseSpend * (1000 / (15 + Math.random() * 10))); // CPM var
          const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.02)); // CTR 1-3%
          const leads = Math.floor(clicks * (0.05 + Math.random() * 0.1)); // Conv 5-15%
          return {
              spend: baseSpend,
              impressions,
              clicks,
              leads,
              cpc: baseSpend / (clicks || 1),
              cpl: baseSpend / (leads || 1),
              ctr: (clicks / (impressions || 1)) * 100
          };
      };

      const campaigns = [
          { 
              id: 'c1', name: 'Leads - Ebook Grátis [Frio]', status: 'ACTIVE', objective: 'OUTCOME_LEADS', budget: 120,
              insights: generateMetrics(1450.50),
              adSets: [
                  {
                      id: 'as1', name: 'Interesses: Marketing Digital', status: 'ACTIVE',
                      insights: generateMetrics(850.20),
                      ads: [
                          { id: 'ad1', name: 'Criativo 01 - Capa Azul', status: 'ACTIVE', insights: generateMetrics(400.00), image: 'https://picsum.photos/200/200?random=1' },
                          { id: 'ad2', name: 'Criativo 02 - Vídeo Depoimento', status: 'ACTIVE', insights: generateMetrics(450.20), image: 'https://picsum.photos/200/200?random=2' }
                      ]
                  },
                  {
                      id: 'as2', name: 'Lookalike 1% Compradores', status: 'ACTIVE',
                      insights: generateMetrics(600.30),
                      ads: [
                          { id: 'ad3', name: 'Criativo 01 - Capa Azul', status: 'ACTIVE', insights: generateMetrics(300.15), image: 'https://picsum.photos/200/200?random=1' },
                          { id: 'ad4', name: 'Criativo 03 - Carrossel', status: 'PAUSED', insights: generateMetrics(300.15), image: 'https://picsum.photos/200/200?random=3' }
                      ]
                  }
              ]
          },
          { 
              id: 'c2', name: 'Vendas - Remarketing 30D', status: 'ACTIVE', objective: 'OUTCOME_SALES', budget: 50,
              insights: generateMetrics(450.75),
              adSets: [
                  {
                      id: 'as3', name: 'Visitou Checkout (Hot)', status: 'ACTIVE',
                      insights: generateMetrics(450.75),
                      ads: [
                          { id: 'ad5', name: 'Oferta Relâmpago', status: 'ACTIVE', insights: generateMetrics(450.75), image: 'https://picsum.photos/200/200?random=4' }
                      ]
                  }
              ]
          },
          { 
              id: 'c3', name: 'Branding - Institucional', status: 'PAUSED', objective: 'OUTCOME_AWARENESS', budget: 30,
              insights: generateMetrics(120.00),
              adSets: []
          }
      ];

      return campaigns;
  }
}

export const facebookService = new FacebookService();
