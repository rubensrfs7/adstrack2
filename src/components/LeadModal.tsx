import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Mail, Phone, Tag, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { FormResponse } from '../types';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LeadModalProps {
  lead: FormResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'informacoes' | 'formulario'>('informacoes');

  if (!isOpen || !lead) return null;

  const hasFormResponse = !!lead.mock_form_response;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col transition-all">
        
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Informações do Lead</h2>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('informacoes')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'informacoes' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Informações
                </button>
                {hasFormResponse && (
                    <button 
                        onClick={() => setActiveTab('formulario')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'formulario' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Formulário
                    </button>
                )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB] dark:bg-black/20 flex flex-col gap-6">
          
          {activeTab === 'informacoes' ? (
              <>
                {/* Row 1: Full-width UTMs */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                        <Tag className="w-3 h-3" /> Origem (UTMs)
                    </h4>
                    <div className="flex flex-row gap-4">
                        {Object.entries(lead.utm_context).map(([key, val]) => (
                            <div key={key} className="flex-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                <span className="block text-[7px] text-gray-400 font-black uppercase mb-0.5">{key}</span>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate block">{val || '---'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: Grid 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Coluna Esquerda: Dados do Lead, WhatsApp, Email, Criativo */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-100 dark:shadow-none">
                                    {(lead.data['Nome'] || lead.data['nome'] || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{lead.data['Nome'] || lead.data['nome'] || 'Sem nome'}</h3>
                                    <p className="text-sm text-gray-500 font-medium">Capturado em {new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                    <Phone className="w-5 h-5 text-green-600" />
                                    <span className="text-md font-black text-green-900 dark:text-green-200">
                                        {lead.data['WhatsApp'] || lead.data['Telefone'] || lead.data['telefone'] || 'Sem WhatsApp'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 px-3">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">{lead.data['Email'] || lead.data['email'] || 'Sem email'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Criativo
                            </h4>
                            <div className="relative rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 aspect-video shadow-sm">
                                <img src={lead.creative_context.image_url} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2">
                                    <span className="text-[9px] font-black text-white uppercase tracking-wider truncate block">{lead.creative_context.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita: Mapa */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-full">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4" /> Localização Aproximada
                        </h4>
                        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                            <MapContainer center={[-15.78, -47.92]} zoom={4} className="w-full h-full">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <CircleMarker center={[-15.78, -47.92]} radius={5} color="blue" />
                            </MapContainer>
                        </div>
                    </div>
                </div>
              </>
          ) : (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Respostas do Formulário</h3>
                  {lead.mock_form_response && Object.entries(lead.mock_form_response).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{key}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{val as string}</p>
                      </div>
                  ))}
              </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeadModal;
