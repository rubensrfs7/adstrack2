import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const pathMap: Record<string, { parent: string; child: string }> = {
  '/': { parent: 'Dashboard', child: 'Geral' },
  '/leads': { parent: 'Leads', child: 'Geral' },
  '/chat': { parent: 'Chat', child: 'Geral' },
  '/relatorios': { parent: 'Relatórios', child: 'Geral' },
  '/location': { parent: 'Flow', child: 'Geral' },
  '/links': { parent: 'AI', child: 'Geral' },
  '/equipe': { parent: 'Equipe', child: 'Geral' },
  '/cadastro': { parent: 'Configurações', child: 'Geral' },
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const currentPath = pathMap[location.pathname];
  
  if (!currentPath) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
      <span className="font-semibold text-gray-800 dark:text-white">{currentPath.parent}</span>
      {currentPath.child && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="font-bold text-gray-900 dark:text-white">{currentPath.child}</span>
        </>
      )}
    </div>
  );
};
