import React, { useState } from 'react';
import { VoiceStyle } from '../types/voice';
import { Play, Check, Sliders, Radio, Sparkles } from 'lucide-react';

interface VoiceSelectorProps {
  styles: VoiceStyle[];
  activeStyleId: string;
  onSelectStyle: (style: VoiceStyle) => void;
  onPreviewStyle: (style: VoiceStyle) => void;
  onCustomizeStyle: (style: VoiceStyle) => void;
  currentlyAuditioningId: string | null;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  styles,
  activeStyleId,
  onSelectStyle,
  onPreviewStyle,
  onCustomizeStyle,
  currentlyAuditioningId
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredStyles = styles.filter(s => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Category selector & description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Styles de Voix pour Munira
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Sélectionnez une empreinte vocale expressive ou auditionnez les timbres en un clic.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#12141d] border border-zinc-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'naturel', label: 'Naturel' },
            { id: 'studio', label: 'Studio' },
            { id: 'artistique', label: 'Artistique' },
            { id: 'futuriste', label: 'Futuriste' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Voice Styles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStyles.map(style => {
          const isSelected = style.id === activeStyleId;
          const isPlaying = currentlyAuditioningId === style.id;

          return (
            <div
              key={style.id}
              className={`relative group rounded-xl p-5 border transition-all duration-200 bg-[#12141f] ${
                isSelected
                  ? 'border-purple-500/80 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
                  : 'border-zinc-800/90 hover:border-zinc-700 hover:bg-[#151724]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: style.accentColor }}
                    />
                    <h3 className="font-semibold text-white text-base tracking-tight">
                      {style.name}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                    {style.subtitle}
                  </p>
                </div>

                {isSelected && (
                  <span className="text-[11px] font-mono text-purple-400 font-medium shrink-0 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Actif
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-300 leading-relaxed min-h-[36px] mb-4">
                {style.description}
              </p>

              {/* Clean metadata without pill boxes */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mb-4 border-t border-zinc-800/60 pt-3">
                <span>Émotion : <strong className="text-zinc-300 font-sans">{style.emotion}</strong></span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="tabular-nums">Pitch : {style.pitch > 0 ? `+${style.pitch}` : style.pitch} st</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="tabular-nums">{style.speed}x</span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onPreviewStyle(style)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60'
                  }`}
                  title="Auditionner la voix avec le nom Munira"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-amber-300' : ''}`} />
                  <span>{isPlaying ? 'Écoute...' : 'Auditionner'}</span>
                </button>

                <button
                  onClick={() => onSelectStyle(style)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {isSelected ? 'Sélectionné' : 'Appliquer'}
                </button>

                <button
                  onClick={() => onCustomizeStyle(style)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                  title="Personnaliser les paramètres dans l'Égaliseur"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
