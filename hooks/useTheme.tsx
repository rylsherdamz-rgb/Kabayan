import { useState } from 'react';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const t = {
    isDarkMode,
    bgPage: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    bgCard: isDarkMode ? 'bg-slate-900' : 'bg-white',
    bgSurface: isDarkMode ? 'bg-slate-800' : 'bg-slate-100',
    
    text: isDarkMode ? 'text-slate-50' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    
    brand: 'text-blue-600',
    brandBg: 'bg-blue-600',
    brandSoft: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
    
    price: 'text-emerald-600',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-100',
    
    icon: isDarkMode ? '#94A3B8' : '#64748B',
    accent: '#2563EB',
  };

  return { t, toggleTheme };
};