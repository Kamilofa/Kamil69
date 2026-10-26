import React, { useState, useRef } from 'react';
import { VoiceStyle, VisualizerMode, InputMode, MUNIRA_SAMPLE_SCRIPTS, AudioRecording } from '../types/voice';
import { audioEngine } from '../services/audioEngine';
import { Visualizer } from './Visualizer';
import { Play, Square, Mic, MicOff, Upload, Disc, Download, Sparkles, RefreshCw, Volume2, SlidersHorizontal, BarChart3, Radio } from 'lucide-react';

interface LivePlaygroundProps {
  currentStyle: VoiceStyle;
  onNewRecording: (rec: AudioRecording) => void;
  onOpenCustomizer: () => void;
}

export const LivePlayground: React.FC<LivePlaygroundProps> = ({
  currentStyle,
  onNewRecording,
  onOpenCustomizer
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('tts');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('wave');
  const [inputText, setInputText] = useState<string>("Bonjour, je m'appelle Munira, et voici ma voix transformée et personnalisée.");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [synthesisEngine, setSynthesisEngine] = useState<'hybrid' | 'phonetic'>('hybrid');
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recordIntervalRef = useRef<number | null>(null);

  // Play text using current voice style
  const handlePlayVoice = () => {
    if (isPlaying) {
      audioEngine.stopAll();
      setIsPlaying(false);
      return;
    }

    if (!inputText.trim()) return;

    setIsPlaying(true);
    audioEngine.applyVoiceStyle(currentStyle);

    if (synthesisEngine === 'phonetic') {
      audioEngine.synthesizePhoneticVocal(inputText, currentStyle, () => {
        setIsPlaying(false);
      });
    } else {
      audioEngine.speakText(inputText, currentStyle, () => {
        setIsPlaying(false);
      });
    }
  };

  // Toggle live microphone morphing
  const handleToggleMic = async () => {
    if (isMicActive) {
      audioEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      const success = await audioEngine.startMicrophone(currentStyle);
      if (success) {
        setIsMicActive(true);
      } else {
        alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès micro dans votre navigateur.");
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = audioEngine.getAudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      setIsPlaying(true);
      await audioEngine.playAudioBuffer(audioBuffer, currentStyle, () => {
        setIsPlaying(false);
      });
    } catch (err) {
      console.error("Erreur de décodage audio", err);
      alert("Format de fichier audio non supporté.");
    }
  };

  // Live Take Recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      const res = await audioEngine.stopRecording();
      setIsRecording(false);
      setRecordTimer(0);

      if (res && res.blob) {
        const url = URL.createObjectURL(res.blob);
        const newRec: AudioRecording = {
          id: `rec-${Date.now()}`,
          title: `Prise Munira (${currentStyle.name})`,
          voiceStyleName: currentStyle.name,
          timestamp: Date.now(),
          duration: Math.max(1, Math.round(res.duration)),
          url,
          blob: res.blob,
          sizeBytes: res.blob.size
        };
        onNewRecording(newRec);
      }
    } else {
      const started = audioEngine.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordTimer(0);
        recordIntervalRef.current = window.setInterval(() => {
          setRecordTimer(t => t + 1);
        }, 1000);

        // If not already emitting audio, trigger the current text automatically
        if (!isPlaying && !isMicActive) {
          handlePlayVoice();
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Frame with Real-Time HUD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Visualiseur Audio Temps Réel</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-purple-400 font-medium">{currentStyle.name}</span>
          </div>

          {/* Visualizer Mode selector buttons */}
          <div className="flex items-center gap-1 bg-[#12141f] border border-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setVisualizerMode('wave')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                visualizerMode === 'wave' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Oscilloscope Onde"
            >
              <Radio className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setVisualizerMode('bars')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                visualizerMode === 'bars' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Spectre Fréquences (FFT)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setVisualizerMode('orb')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                visualizerMode === 'orb' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Orbe Vocal Réactif"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Visualizer
          mode={visualizerMode}
          isActive={isPlaying || isMicActive || isRecording}
          accentColor={currentStyle.accentColor}
          styleName={currentStyle.name}
        />
      </div>

      {/* Main Studio Control Deck */}
      <div className="bg-[#11131c] rounded-xl border border-zinc-800/90 p-5 md:p-6 space-y-5">
        
        {/* Source Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-[#0b0c12] border border-zinc-800/80 rounded-lg">
            <button
              onClick={() => {
                if (isMicActive) handleToggleMic();
                setInputMode('tts');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                inputMode === 'tts'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Synthèse du nom Munira</span>
            </button>

            <button
              onClick={() => setInputMode('mic')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                inputMode === 'mic'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Microphone Direct</span>
            </button>

            <button
              onClick={() => {
                if (isMicActive) handleToggleMic();
                setInputMode('file');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                inputMode === 'file'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fichier Audio</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/70 hover:bg-zinc-700/80 rounded-lg border border-zinc-700/50 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Régler DSP & FX</span>
            </button>

            <button
              onClick={handleToggleRecording}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${isRecording ? 'animate-spin' : 'text-rose-400'}`} />
              <span className="tabular-nums">
                {isRecording ? `Enregistrement ${recordTimer}s` : 'Capturer la Prise'}
              </span>
            </button>
          </div>
        </div>

        {/* Input Panel 1: TTS & Phonetics */}
        {inputMode === 'tts' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-zinc-300 font-medium">Texte à déclamer avec la voix de Munira :</label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Moteur de rendu :</span>
                  <button
                    onClick={() => setSynthesisEngine(s => s === 'hybrid' ? 'phonetic' : 'hybrid')}
                    className="text-xs text-purple-400 hover:underline cursor-pointer"
                  >
                    {synthesisEngine === 'hybrid' ? 'Voix Hybride Studio' : 'Formants Résonants Pure Synth'}
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                placeholder="Entrez votre phrase contenant le nom Munira..."
                className="w-full bg-[#0a0b10] border border-zinc-800 rounded-lg p-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-sans resize-none"
              />
            </div>

            {/* Quick Sample Chips highlighting "Munira" */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Exemples de déclamations avec le nom Munira :
              </span>
              <div className="flex flex-wrap gap-2">
                {MUNIRA_SAMPLE_SCRIPTS.map((script, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(script.text);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 transition-colors text-left truncate max-w-xs cursor-pointer"
                    title={script.text}
                  >
                    {script.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phonetic Pronunciation Variations for "Munira" */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-400">Variantes d'inflexion du nom :</span>
              {[
                { label: 'Munira (Classique)', val: "Munira." },
                { label: 'Mounira (Chanté)', val: "Mounira..." },
                { label: 'Mu-ni-ra (Articulé)', val: "Mu... ni... ra." },
                { label: 'Munîra Rayonnante', val: "Munîra, la voix éclatante !" }
              ].map((v, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(v.val)}
                  className="px-2 py-1 text-[11px] rounded bg-zinc-800/50 hover:bg-zinc-800 text-purple-300 border border-purple-500/20 cursor-pointer"
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Trigger Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handlePlayVoice}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-sm font-semibold transition-all shadow-md cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20 active:scale-[0.99]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>Arrêter l'Élocution</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Prononcer et Métamorphoser en {currentStyle.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Input Panel 2: Live Microphone */}
        {inputMode === 'mic' && (
          <div className="p-6 bg-[#0a0b10] rounded-xl border border-zinc-800 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Mic className={`w-8 h-8 ${isMicActive ? 'text-rose-500 animate-pulse' : 'text-zinc-500'}`} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Transformateur Vocal Direct (Microphone)
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Parlez dans votre micro : votre voix est modulée en direct avec les filtres et effets de <strong>{currentStyle.name}</strong>.
              </p>
              <p className="text-[11px] text-amber-400 mt-2 font-mono">
                Casque ou écouteurs vivement recommandés pour éviter l'effet larsen/écho.
              </p>
            </div>

            <div>
              <button
                onClick={handleToggleMic}
                className={`px-6 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isMicActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                }`}
              >
                {isMicActive ? 'Couper le Microphone' : 'Activer le Modulateur Micro'}
              </button>
            </div>
          </div>
        )}

        {/* Input Panel 3: Audio File */}
        {inputMode === 'file' && (
          <div className="p-6 bg-[#0a0b10] rounded-xl border border-zinc-800 text-center space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Upload className="w-7 h-7 text-indigo-400" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Importer un Échantillon Audio
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Chargez un fichier vocal (.mp3, .wav) pour lui appliquer instantanément la métamorphose vocale de Munira.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Sélectionner un Fichier Audio
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
