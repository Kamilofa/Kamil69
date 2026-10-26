import React from 'react';
import { Sparkles, Sliders, Volume2, Mic, Library, Disc } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickDemo: () => void;
  isAudioPlaying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onQuickDemo,
  isAudioPlaying
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#090A0F]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Brand Zone - Single element wordmark per design contract */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-purple-300 transition-colors"
          >
            Munira Voice Studio
          </a>
        </div>

        {/* Navigation Links - 4-5 concise single-line links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={() => onTabChange('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'studio' ? 'text-white' : 'hover:text-zinc-200'
            }`}
          >
            Studio Vocal
          </button>
          <button
            onClick={() => onTabChange('styles')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'styles' ? 'text-white' : 'hover:text-zinc-200'
            }`}
          >
            Styles de Voix
          </button>
          <button
            onClick={() => onTabChange('equalizer')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'equalizer' ? 'text-white' : 'hover:text-zinc-200'
            }`}
          >
            Égaliseur & FX
          </button>
          <button
            onClick={() => onTabChange('scripts')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'scripts' ? 'text-white' : 'hover:text-zinc-200'
            }`}
          >
            Répliques Munira
          </button>
          <button
            onClick={() => onTabChange('recordings')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'recordings' ? 'text-white' : 'hover:text-zinc-200'
            }`}
          >
            Enregistrements
          </button>
        </nav>

        {/* Zone 3 - 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickDemo}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 rounded-lg shadow-md shadow-purple-600/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAudioPlaying ? 'Arrêter Audio' : 'Prononcer Munira'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
