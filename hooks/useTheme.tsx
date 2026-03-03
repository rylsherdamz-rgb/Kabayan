import { useState } from 'react';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    isDarkMode,
    bgPage: isDarkMode ? 'bg-[#020617]' : 'bg-[#F1F5F9]',
    bgCard: isDarkMode ? 'bg-[#0F172A]' : 'bg-white',
    text: isDarkMode ? 'text-slate-50' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
    primary: 'bg-blue-600',
    icon: isDarkMode ? '#94A3B8' : '#64748B'
  };

  return { t: theme, toggleTheme };
};