import React from 'react';
import { VoiceStyle } from '../types/voice';
import { RotateCcw, Save, Sliders, Volume2, Waves, Radio, Activity, Sparkles } from 'lucide-react';

interface CustomizerControlsProps {
  currentStyle: VoiceStyle;
  onChange: (updated: VoiceStyle) => void;
  onReset: () => void;
  onSaveAsCustom: (style: VoiceStyle) => void;
  onTestCurrentVoice: () => void;
  isTesting: boolean;
}

export const CustomizerControls: React.FC<CustomizerControlsProps> = ({
  currentStyle,
  onChange,
  onReset,
  onSaveAsCustom,
  onTestCurrentVoice,
  isTesting
}) => {
  const updateField = <K extends keyof VoiceStyle>(field: K, value: VoiceStyle[K]) => {
    onChange({
      ...currentStyle,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Console de Personnalisation Avancée
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Mode édition pour le style : <span className="text-purple-300 font-semibold">{currentStyle.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTestCurrentVoice}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isTesting
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isTesting ? 'Écoute en cours...' : 'Tester le Rendu'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
            title="Réinitialiser aux valeurs par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={() => onSaveAsCustom(currentStyle)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sauvegarder Preset</span>
          </button>
        </div>
      </div>

      {/* Grid of Sound Design Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Hauteur & Timbre Corporel */}
        <div className="bg-[#11131c] rounded-xl p-5 border border-zinc-800/80 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Hauteur & Timbre Vocal</h3>
          </div>

          {/* Pitch */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Hauteur (Pitch)</span>
              <span className="text-purple-400 font-mono tabular-nums">
                {currentStyle.pitch > 0 ? `+${currentStyle.pitch}` : currentStyle.pitch} demi-tons
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={currentStyle.pitch}
              onChange={(e) => updateField('pitch', parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>-12 Grave</span>
              <span>0 Naturel</span>
              <span>+12 Aigu</span>
            </div>
          </div>

          {/* Formants (Vocal Tract) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Décalage des Formants</span>
              <span className="text-purple-400 font-mono tabular-nums">
                {currentStyle.formantShift.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.02"
              value={currentStyle.formantShift}
              onChange={(e) => updateField('formantShift', parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>Voix ample</span>
              <span>1.0x Normal</span>
              <span>Voix fine</span>
            </div>
          </div>

          {/* Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Vitesse d'élocution</span>
              <span className="text-purple-400 font-mono tabular-nums">
                {currentStyle.speed.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.7"
              step="0.05"
              value={currentStyle.speed}
              onChange={(e) => updateField('speed', parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>0.6x Posé</span>
              <span>1.0x Rythme standard</span>
              <span>1.7x Rapide</span>
            </div>
          </div>

          {/* Warmth & Breathiness */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Chaleur Analogique (Saturation)</span>
              <span className="text-purple-400 font-mono tabular-nums">
                {Math.round(currentStyle.timbreWarmth)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={currentStyle.timbreWarmth}
              onChange={(e) => updateField('timbreWarmth', parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Souffle & Présence d'air (ASMR)</span>
              <span className="text-purple-400 font-mono tabular-nums">
                {Math.round(currentStyle.breathiness)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={currentStyle.breathiness}
              onChange={(e) => updateField('breathiness', parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Module 2: Égaliseur 3 Bandes */}
        <div className="bg-[#11131c] rounded-xl p-5 border border-zinc-800/80 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Égaliseur 3 Bandes</h3>
          </div>

          {/* Bass */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Graves (180 Hz) - Rondeur</span>
              <span className="text-indigo-400 font-mono tabular-nums">
                {currentStyle.bassGain > 0 ? `+${currentStyle.bassGain.toFixed(1)}` : currentStyle.bassGain.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={currentStyle.bassGain}
              onChange={(e) => updateField('bassGain', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>-12 dB</span>
              <span>0 dB Flat</span>
              <span>+12 dB</span>
            </div>
          </div>

          {/* Mids */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Médiums (1.6 kHz) - Clarté vocale</span>
              <span className="text-indigo-400 font-mono tabular-nums">
                {currentStyle.midGain > 0 ? `+${currentStyle.midGain.toFixed(1)}` : currentStyle.midGain.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={currentStyle.midGain}
              onChange={(e) => updateField('midGain', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>-12 dB</span>
              <span>0 dB Flat</span>
              <span>+12 dB</span>
            </div>
          </div>

          {/* Treble */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Aigus (6.5 kHz) - Brillance & Présence</span>
              <span className="text-indigo-400 font-mono tabular-nums">
                {currentStyle.trebleGain > 0 ? `+${currentStyle.trebleGain.toFixed(1)}` : currentStyle.trebleGain.toFixed(1)} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={currentStyle.trebleGain}
              onChange={(e) => updateField('trebleGain', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>-12 dB</span>
              <span>0 dB Flat</span>
              <span>+12 dB</span>
            </div>
          </div>

          {/* Compression Dynamics */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Compression Broadcast</span>
              <span className="text-indigo-400 font-mono tabular-nums">
                {Math.round(currentStyle.compression * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={currentStyle.compression}
              onChange={(e) => updateField('compression', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400">
              Harmonise le niveau sonore pour un rendu professionnel radio/podcast.
            </p>
          </div>
        </div>

        {/* Module 3: Espace Acoustique & Effets Spéciaux */}
        <div className="bg-[#11131c] rounded-xl p-5 border border-zinc-800/80 space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Waves className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white text-sm">Espace & Effets Spéciaux</h3>
          </div>

          {/* Reverb Type */}
          <div className="space-y-1.5">
            <span className="text-xs text-zinc-300 font-medium block">Environnement Acoustique</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: 'Sec (Sans Reverb)' },
                { id: 'studio', label: 'Studio Traité' },
                { id: 'chamber', label: 'Chambre Douce' },
                { id: 'hall', label: 'Grand Hall' },
                { id: 'cathedral', label: 'Cathédrale' }
              ].map(rev => (
                <button
                  key={rev.id}
                  onClick={() => updateField('reverbType', rev.id as VoiceStyle['reverbType'])}
                  className={`px-2.5 py-1.5 text-xs rounded-md text-left transition-all truncate cursor-pointer ${
                    currentStyle.reverbType === rev.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {rev.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reverb Mix */}
          {currentStyle.reverbType !== 'none' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Intensité de Réverbération</span>
                <span className="text-amber-400 font-mono tabular-nums">
                  {Math.round(currentStyle.reverbMix * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={currentStyle.reverbMix}
                onChange={(e) => updateField('reverbMix', parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
              />
            </div>
          )}

          {/* Echo / Delay */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Écho Temporel (Délai)</span>
              <span className="text-amber-400 font-mono tabular-nums">
                {Math.round(currentStyle.echoTime * 1000)} ms
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.02"
              value={currentStyle.echoTime}
              onChange={(e) => updateField('echoTime', parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Chorus / Stereo Widening */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Chorus & Élargissement Stéréo</span>
              <span className="text-amber-400 font-mono tabular-nums">
                {Math.round(currentStyle.chorusMix * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={currentStyle.chorusMix}
              onChange={(e) => updateField('chorusMix', parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Robot Vocoder toggle */}
          <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Mode Cyber Vocoder</span>
              </div>
              <button
                onClick={() => updateField('robotMod', !currentStyle.robotMod)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  currentStyle.robotMod
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {currentStyle.robotMod ? 'Actif' : 'Désactivé'}
              </button>
            </div>

            {currentStyle.robotMod && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Fréquence de modulation</span>
                  <span className="text-cyan-400 font-mono tabular-nums">{currentStyle.robotFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="500"
                  step="10"
                  value={currentStyle.robotFreq}
                  onChange={(e) => updateField('robotFreq', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
