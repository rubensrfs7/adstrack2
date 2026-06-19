import React from 'react';
import { X, MessageCircle, Facebook, Phone, Mail, Send, Headset } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#1a1d23] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Headset className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Canais de Suporte</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Entre em contato pelo canal de sua preferência.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <a href="#" className="flex items-center gap-4 p-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white">
            <MessageCircle className="w-6 h-6" />
            <div className="flex-1">
              <p className="font-bold">Chat de Suporte Online</p>
              <p className="text-sm opacity-90">Converse agora com a nossa equipe.</p>
            </div>
          </a>

          {[
            { icon: Facebook, label: 'https://www.facebook.com/mzchatbots', href: '#' },
            { icon: Send, label: 'https://t.me/MZWorkspace', href: '#' },
            { icon: Phone, label: '+5513997438073', href: 'tel:+5513997438073' },
            { icon: Mail, label: 'suporte@mzworkspace.com', href: 'mailto:suporte@mzworkspace.com' },
          ].map((channel, i) => (
            <a 
              key={i} 
              href={channel.href} 
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <channel.icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium">{channel.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
