
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RotateCcw, Upload, Calendar, Search, Trash2 } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../constants';
import { DateRangePicker } from './DateRangePicker';
import { Campaign, FormResponse } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Logo } from './Logo';

const ReportsPage: React.FC = () => {
  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  
  // Data State
  const [filteredData, setFilteredData] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  // Loading State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // References
  const reportRef = useRef<HTMLDivElement>(null);

  // Filter Logic
  useEffect(() => {
    let data = [...MOCK_CAMPAIGNS];

    if (selectedCampaignId) {
      data = data.filter(c => c.id === selectedCampaignId);
    }

    if (startDate) {
      data = data.filter(c => new Date(c.createdAt) >= new Date(startDate));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      data = data.filter(c => new Date(c.createdAt) <= end);
    }

    // Sort by clicks descending for the report
    data.sort((a, b) => b.clicks - a.clicks);
    setFilteredData(data);
  }, [startDate, endDate, selectedCampaignId]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCampaignId('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Nome da Campanha', 'Criativo', 'Conjunto', 'Origem', 'Cliques', 'Data Criação'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(c => [
        `"${c.name}"`,
        `"${c.creativeName}"`,
        `"${c.utm.medium}"`,
        `"${c.utm.source}"`,
        c.clicks,
        new Date(c.createdAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_desempenho_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // Wait for images to load if needed (though usually base64/cached)
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        useCORS: true, // For external images
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error generating PDF", err);
      alert("Erro ao gerar PDF. Verifique se todas as imagens carregaram.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Metrics calculation
  const totalClicks = filteredData.reduce((acc, curr) => acc + curr.clicks, 0);
  const avgClicks = filteredData.length > 0 ? Math.round(totalClicks / filteredData.length) : 0;
  const avgScore = filteredData.length > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + (curr.score || 0), 0) / filteredData.length) : 0;
  const top5Campaigns = filteredData.slice(0, 5);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Relatórios e Análises
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gere insights detalhados sobre suas campanhas.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? 'Gerando...' : <><Download className="w-4 h-4" /> PDF</>}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row gap-4 items-end lg:items-center">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Campanha</label>
            <div className="relative">
              <select 
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Todas as Campanhas</option>
                {MOCK_CAMPAIGNS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Período de Análise</label>
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
          <button 
            onClick={handleResetFilters}
            className="mt-5 p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl border border-gray-100 dark:border-gray-800 transition-all"
            title="Limpar Filtros"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Preview */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Configuration Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
           <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
             <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Personalização
             </h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Logo da Empresa</label>
                   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer bg-gray-50 dark:bg-gray-800/50 transition-colors">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo" className="h-full object-contain p-2" />
                      ) : (
                        <div className="text-center text-gray-500">
                           <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                           <span className="text-xs">Clique para upload (PNG/JPG)</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   </label>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-lg">
                   <strong>Dica:</strong> O relatório gerado ao lado é uma prévia exata de como ficará o PDF. Ajuste os filtros para alterar os dados.
                </div>
             </div>
           </div>
        </div>

        {/* Right: A4 Preview Container */}
        <div className="w-full lg:w-2/3 overflow-x-auto bg-gray-200 dark:bg-black p-4 rounded-lg border border-gray-300 dark:border-gray-800 flex justify-center">
            {/* The Actual Report DOM Element to Capture */}
            <div 
               id="report-preview" 
               ref={reportRef}
               className="a4-paper relative flex flex-col justify-between text-gray-900"
               style={{ width: '210mm', minHeight: '297mm', padding: '20mm', backgroundColor: 'white' }}
            >
               {/* Header */}
               <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-8">
                  <div className="w-32 h-16 flex items-center">
                     {companyLogo ? (
                        <img src={companyLogo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                     ) : (
                        <Logo className="h-8 text-gray-900" />
                     )}
                  </div>
                  <div className="text-right">
                     <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Relatório de<br/>Desempenho</h1>
                     <p className="text-sm text-gray-500 mt-1">
                        {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                  </div>
               </div>

               {/* Summary Section */}
               <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-4">Resumo Geral</h2>
                  <div className="grid grid-cols-4 gap-4">
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <span className="block text-xs text-gray-500 uppercase">Total de Cliques</span>
                        <span className="block text-2xl font-bold text-blue-600">{totalClicks.toLocaleString()}</span>
                     </div>
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <span className="block text-xs text-gray-500 uppercase">Campanhas Ativas</span>
                        <span className="block text-2xl font-bold text-gray-800">{filteredData.length}</span>
                     </div>
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <span className="block text-xs text-gray-500 uppercase">Média Cliques</span>
                        <span className="block text-2xl font-bold text-gray-800">{avgClicks.toLocaleString()}</span>
                     </div>
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <span className="block text-xs text-gray-500 uppercase">Score Médio</span>
                        <span className={`block text-2xl font-bold ${avgScore >= 70 ? 'text-emerald-600' : 'text-blue-600'}`}>{avgScore}/100</span>
                     </div>
                  </div>
                  {startDate && endDate && (
                     <p className="text-xs text-gray-500 mt-2 text-right">
                        Período: {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                     </p>
                  )}
               </div>

               {/* Top Campaigns Table */}
               <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-4">Top 5 Campanhas</h2>
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                        <tr>
                           <th className="p-3">Campanha</th>
                           <th className="p-3">Criativo</th>
                           <th className="p-3 text-center">Score</th>
                           <th className="p-3 text-right">Cliques</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                        {top5Campaigns.map((c, i) => (
                           <tr key={c.id}>
                              <td className="p-3 font-medium">{c.name}</td>
                              <td className="p-3 text-gray-600">{c.creativeName}</td>
                              <td className="p-3 text-center">
                                 <span className={`font-bold ${
                                   (c.score || 0) >= 85 ? 'text-blue-600' :
                                   (c.score || 0) >= 65 ? 'text-emerald-600' :
                                   (c.score || 0) >= 40 ? 'text-yellow-600' :
                                   'text-red-500'
                                 }`}>
                                   {c.score || 0}
                                 </span>
                              </td>
                              <td className="p-3 text-right font-bold">{c.clicks.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Visual Chart Section */}
               <div className="mb-8 flex-1">
                  <h2 className="text-lg font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">Desempenho Visual (Top 5)</h2>
                  
                  <div className="space-y-6">
                     {top5Campaigns.map((c) => {
                        const maxClick = top5Campaigns[0]?.clicks || 1;
                        const percentage = (c.clicks / maxClick) * 100;
                        
                        return (
                           <div key={c.id} className="flex items-center gap-4">
                              {/* Image */}
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                 <img src={c.imageUrl} alt="Creative" className="w-full h-full object-cover" />
                              </div>
                              
                              {/* Bar Chart Info */}
                              <div className="flex-1">
                                 <div className="flex justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                       <span className="font-bold text-sm text-gray-800">{c.name}</span>
                                       <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                                          (c.score || 0) >= 85 ? 'bg-blue-100 text-blue-600' :
                                          (c.score || 0) >= 65 ? 'bg-emerald-100 text-emerald-600' :
                                          (c.score || 0) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-600'
                                       }`}>
                                          Score: {c.score || 0}
                                       </span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">{c.clicks.toLocaleString()} clicks</span>
                                 </div>
                                 <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div 
                                       className={`h-full rounded-full ${
                                          (c.score || 0) >= 85 ? 'bg-blue-500' :
                                          (c.score || 0) >= 65 ? 'bg-emerald-500' :
                                          (c.score || 0) >= 40 ? 'bg-yellow-500' :
                                          'bg-red-500'
                                       }`} 
                                       style={{ width: `${percentage}%` }}
                                    ></div>
                                 </div>
                                 <p className="text-[10px] text-gray-400 mt-1">Criativo: {c.creativeName}</p>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Footer */}
               <div className="mt-auto border-t border-gray-200 pt-6 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                     <p>AdsTrack - Relatório Gerado Automaticamente</p>
                     <p>www.adstrack.com.br</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <div className="text-right">
                        <p className="text-xs font-bold text-gray-600 uppercase">Gerado Por</p>
                        <p className="text-sm font-medium text-gray-800">Admin User</p>
                     </div>
                     <img 
                        src="https://picsum.photos/40/40?random=99" 
                        alt="User" 
                        className="w-10 h-10 rounded-full border border-gray-300" 
                     />
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
