import React from 'react';
import { Settings, Clock, AlertCircle, CheckCircle2, Eye, Save, Play, ChevronRight } from 'lucide-react';

export default function WebhookPage() {
  return (
    <div className="max-w-12xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-sm text-gray-500 gap-2">
            <span>Início</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">Configurações</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-blue-500" /> Webhook
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Left: Configuration */}
        <div className="bg-white dark:bg-[#0f1114] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" /> Configuração de Webhook
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Endpoint (POST)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value="https://n8n.automation.mzworkspace.com/webhook-test/e2b3a695-764e-46b3-ab50-15a67de544a4"
                  className="w-full bg-gray-50 dark:bg-[#1a1d23] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Sempre que um novo lead entrar, enviaremos um JSON com os dados para este endereço. Deixe em branco para desativar.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Token de autorização (opcional)</label>
              <div className="relative">
                <input type="password" value="secret" className="w-full bg-gray-50 dark:bg-[#1a1d23] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white" readOnly />
                <button className="absolute right-3 top-3 text-gray-400"><Eye className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Enviado no header <span className="font-mono bg-gray-100 dark:bg-[#25282e] px-1 rounded">Authorization</span> de cada requisição.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#1a1d23] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"><Settings className="w-3 h-3" /> PAYLOAD EXEMPLO</h3>
                <pre className="text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
{`{
  "id": "lead-123",
  "name": "Nome do Lead",
  "email": "lead@exemplo.com",
  "phone": "5511999999999",
  "source": "Facebook",
  "campaign": "Campanha",
  "medium": "Medium",
  "content": "Content",
  "created_at": "2024-03-20T10:00:00Z"
}`}
                </pre>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-white/10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#25282e] transition-all">
               <Play className="w-4 h-4" /> TESTAR DISPARO
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-sm">
               <Save className="w-4 h-4" /> SALVAR
            </button>
          </div>
        </div>

        {/* Right: History */}
        <div className="bg-white dark:bg-[#0f1114] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Histórico de Disparos
            </h2>
            <span className="text-xs text-gray-400">ÚLTIMOS 50</span>
          </div>

          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/50">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold mb-2">
                   <AlertCircle className="w-4 h-4" /> FALHA • 19/06/2026, 16:17:38
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono mb-2">https://n8n.automation.mzworkspace.com/webhook-test/.../5513...4</p>
                <div className="bg-white dark:bg-[#1a1d23] p-2 rounded text-[10px] text-gray-500">Response: Failed to fetch</div>
             </div>

             <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                   <CheckCircle2 className="w-4 h-4" /> SUCESSO • 09/04/2026, 16:04:53
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono mb-2">https://n8n.automation.mzworkspace.com/webhook-test/.../5513...4</p>
                <div className="bg-white dark:bg-[#1a1d23] p-2 rounded text-[10px] text-gray-500">Response: {"{"}"message":"Workflow was started"{"}"}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
