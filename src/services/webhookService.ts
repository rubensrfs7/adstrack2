
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface WebhookConfig {
  endpoint: string;
  token: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error';
  payload: any;
  response: string;
  endpoint: string;
}

const STORAGE_KEY = 'adstrack_webhook_config';
const LOGS_KEY = 'adstrack_webhook_logs';

export const getWebhookConfig = (): WebhookConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { endpoint: '', token: '' };
};

export const saveWebhookConfig = (config: WebhookConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const getWebhookLogs = (): WebhookLog[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addLog = (log: Omit<WebhookLog, 'id' | 'timestamp'>) => {
  const logs = getWebhookLogs();
  const newLog: WebhookLog = {
    ...log,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  };
  const updatedLogs = [newLog, ...logs].slice(0, 50); // Keep last 50
  localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
  return newLog;
};

export const triggerWebhook = async (leadData: any) => {
  const config = getWebhookConfig();
  if (!config.endpoint) return;

  const payload = {
    ...leadData,
    triggered_at: new Date().toISOString()
  };

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    addLog({
      status: response.ok ? 'success' : 'error',
      payload,
      response: responseText || (response.ok ? 'OK' : 'Error'),
      endpoint: config.endpoint
    });

    return response.ok;
  } catch (error) {
    addLog({
      status: 'error',
      payload,
      response: error instanceof Error ? error.message : 'Unknown error',
      endpoint: config.endpoint
    });
    return false;
  }
};
