import React, { useState, useEffect } from 'react';
import { VoiceStyle, MUNIRA_PRESET_STYLES, AudioRecording } from './types/voice';
import { audioEngine } from './services/audioEngine';
import { Header } from './components/Header';
import { LivePlayground } from './components/LivePlayground';
import { VoiceSelector } from './components/VoiceSelector';
import { CustomizerControls } from './components/CustomizerControls';
import { MuniraScriptGenerator } from './components/MuniraScriptGenerator';
import { AudioRecordingsList } from './components/AudioRecordingsList';
import { Volume2, Sparkles, Sliders, Mic, Disc, Headphones, Info, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [styles, setStyles] = useState<VoiceStyle[]>(() => {
    const saved = localStorage.getItem('munira_voice_styles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MUNIRA_PRESET_STYLES;
      }
    }
    return MUNIRA_PRESET_STYLES;
  });

  const [activeStyleId, setActiveStyleId] = useState<string>('munira-rayonnante');
  const [currentlyAuditioningId, setCurrentlyAuditioningId] = useState<string | null>(null);
  const [isQuickDemoPlaying, setIsQuickDemoPlaying] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active voice style object
  const currentStyle = styles.find(s => s.id === activeStyleId) || styles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync active style to DSP engine whenever it changes
  useEffect(() => {
    audioEngine.applyVoiceStyle(currentStyle);
  }, [currentStyle]);

  // Handle previewing a style directly with "Munira"
  const handlePreviewStyle = (style: VoiceStyle) => {
    if (currentlyAuditioningId === style.id) {
      audioEngine.stopAll();
      setCurrentlyAuditioningId(null);
      return;
    }

    setCurrentlyAuditioningId(style.id);
    audioEngine.applyVoiceStyle(style);
    audioEngine.speakText(style.sampleScript, style, () => {
      setCurrentlyAuditioningId(null);
    });
  };

  // Quick Demo from Header
  const handleQuickDemo = () => {
    if (isQuickDemoPlaying) {
      audioEngine.stopAll();
      setIsQuickDemoPlaying(false);
      return;
    }

    setIsQuickDemoPlaying(true);
    audioEngine.applyVoiceStyle(currentStyle);
    audioEngine.speakText(`Munira... Une voix personnalisée, expressive et vibrante.`, currentStyle, () => {
      setIsQuickDemoPlaying(false);
    });
  };

  // Select a style and update DSP
  const handleSelectStyle = (style: VoiceStyle) => {
    setActiveStyleId(style.id);
    audioEngine.applyVoiceStyle(style);
    showToast(`Style activé : ${style.name}`);
  };

  // Open customizer directly for a style
  const handleCustomizeStyle = (style: VoiceStyle) => {
    setActiveStyleId(style.id);
    setActiveTab('equalizer');
  };

  // Update style settings live
  const handleUpdateStyle = (updated: VoiceStyle) => {
    setStyles(prev => prev.map(s => s.id === updated.id ? updated : s));
    audioEngine.applyVoiceStyle(updated);
  };

  // Reset to default preset
  const handleResetStyle = () => {
    const original = MUNIRA_PRESET_STYLES.find(s => s.id === activeStyleId);
    if (original) {
      handleUpdateStyle({ ...original });
      showToast("Paramètres réinitialisés aux valeurs d'origine.");
    }
  };

  // Save as new custom preset
  const handleSaveAsCustom = (styleToSave: VoiceStyle) => {
    const customName = prompt("Nom du nouveau style personnalisé pour Munira :", `${styleToSave.name} (Custom)`);
    if (!customName) return;

    const newStyle: VoiceStyle = {
      ...styleToSave,
      id: `custom-${Date.now()}`,
      name: customName,
      category: 'naturel',
      subtitle: 'Style personnalisé créé dans le Studio',
      accentColor: '#ec4899'
    };

    const updatedStyles = [...styles, newStyle];
    setStyles(updatedStyles);
    setActiveStyleId(newStyle.id);
    localStorage.setItem('munira_voice_styles', JSON.stringify(updatedStyles));
    showToast(`Nouveau style vocal « ${customName} » sauvegardé !`);
  };

  // Test current voice in Customizer
  const handleTestCurrentVoice = () => {
    setIsQuickDemoPlaying(true);
    audioEngine.applyVoiceStyle(currentStyle);
    audioEngine.speakText(`Test acoustique pour le style ${currentStyle.name}. Clarté, timbre et dynamique.`, currentStyle, () => {
      setIsQuickDemoPlaying(false);
    });
  };

  // Handle adding a new take recording
  const handleNewRecording = (rec: AudioRecording) => {
    setRecordings(prev => [rec, ...prev]);
    showToast(`Prise « ${rec.title} » enregistrée avec succès !`);
  };

  // Delete recording
  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    showToast("Enregistrement supprimé.");
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickDemo={handleQuickDemo}
        isAudioPlaying={isQuickDemoPlaying}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">
        
        {/* Hero Spotlight Section */}
        <section className="relative overflow-hidden rounded-2xl bg-[#0f111a] border border-zinc-800/80 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title & Mission */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-purple-400 font-semibold tracking-wider uppercase">MÉTADONNÉES VOCALES</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>DSP TEMPS RÉEL</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="text-amber-400">PRÉNOM : MUNIRA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
                Métamorphosez la voix au nom de <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Munira</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                Transformez chaque nuance, intonation et timbre vocal en une voix expressive, vivante et sur mesure. Passez d'une narration conteuse intime à une clarté broadcast ou un vocoder futuriste grâce au processeur audio Web Audio API.
              </p>

              {/* Quick stats strip without pills */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-zinc-400 font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Style Actif</span>
                  <span className="text-white font-semibold text-sm">{currentStyle.name}</span>
                </div>
                <div className="w-px h-7 bg-zinc-800" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Hauteur / Tonalité</span>
                  <span className="text-purple-300 font-semibold text-sm tabular-nums">
                    {currentStyle.pitch > 0 ? `+${currentStyle.pitch}` : currentStyle.pitch} demi-tons
                  </span>
                </div>
                <div className="w-px h-7 bg-zinc-800" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Conduit Vocal</span>
                  <span className="text-indigo-300 font-semibold text-sm tabular-nums">
                    {currentStyle.formantShift.toFixed(2)}x
                  </span>
                </div>
                <div className="w-px h-7 bg-zinc-800" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Acoustique</span>
                  <span className="text-amber-300 font-semibold text-sm capitalize">
                    {currentStyle.reverbType}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Persona Portrait & Soundwave Card */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative group w-full max-w-xs rounded-xl overflow-hidden border border-zinc-800/90 bg-[#141624] shadow-xl">
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <img
                    src="/src/assets/images/munira_avatar_portrait_1793034637420.jpg"
                    alt="Portrait de Munira dans son studio vocal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-4 bg-[#141624] space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-tight">Munira</h3>
                    <span className="text-[11px] font-mono text-purple-400">Émission 48 kHz</span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    « Source de lumière & d'harmonie vocale »
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Viewport Router Tabs */}
        <div className="space-y-6">
          {activeTab === 'studio' && (
            <div className="space-y-8">
              {/* Live Audio Playground */}
              <LivePlayground
                currentStyle={currentStyle}
                onNewRecording={handleNewRecording}
                onOpenCustomizer={() => setActiveTab('equalizer')}
              />

              {/* Quick Style Switcher Carousel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Palette Rapide des Styles Vocaux
                  </h3>
                  <button
                    onClick={() => setActiveTab('styles')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
                  >
                    Voir tous les styles →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {styles.map(style => {
                    const isSelected = style.id === activeStyleId;
                    return (
                      <button
                        key={style.id}
                        onClick={() => handleSelectStyle(style)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#181a29] border-purple-500/80 shadow-md ring-1 ring-purple-500/30'
                            : 'bg-[#10121b] border-zinc-800 hover:border-zinc-700 hover:bg-[#141622]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full block mb-2"
                          style={{ backgroundColor: style.accentColor }}
                        />
                        <h4 className="text-xs font-semibold text-white truncate">
                          {style.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {style.emotion}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Takes list preview */}
              {recordings.length > 0 && (
                <div className="pt-2">
                  <AudioRecordingsList
                    recordings={recordings.slice(0, 3)}
                    onDeleteRecording={handleDeleteRecording}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'styles' && (
            <VoiceSelector
              styles={styles}
              activeStyleId={activeStyleId}
              onSelectStyle={handleSelectStyle}
              onPreviewStyle={handlePreviewStyle}
              onCustomizeStyle={handleCustomizeStyle}
              currentlyAuditioningId={currentlyAuditioningId}
            />
          )}

          {activeTab === 'equalizer' && (
            <CustomizerControls
              currentStyle={currentStyle}
              onChange={handleUpdateStyle}
              onReset={handleResetStyle}
              onSaveAsCustom={handleSaveAsCustom}
              onTestCurrentVoice={handleTestCurrentVoice}
              isTesting={isQuickDemoPlaying}
            />
          )}

          {activeTab === 'scripts' && (
            <MuniraScriptGenerator
              currentStyle={currentStyle}
              onSendToStudio={(text) => {
                setActiveTab('studio');
                showToast("Réplique transférée dans le Studio Vocal !");
              }}
              onPlayScript={(text) => {
                setIsQuickDemoPlaying(true);
                audioEngine.applyVoiceStyle(currentStyle);
                audioEngine.speakText(text, currentStyle, () => {
                  setIsQuickDemoPlaying(false);
                });
              }}
            />
          )}

          {activeTab === 'recordings' && (
            <AudioRecordingsList
              recordings={recordings}
              onDeleteRecording={handleDeleteRecording}
            />
          )}
        </div>
      </main>

      {/* Studio Footer */}
      <footer className="mt-16 border-t border-zinc-900 bg-[#06070a] px-4 md:px-8 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-zinc-300">Munira Voice Morph Studio</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Moteur audio Web Audio API haute fidélité</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>DSP 48kHz Stéréo</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Égaliseur 3-Bandes & Convolution</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span className="text-zinc-500">© 2026 Munira Studio</span>
          </div>
        </div>
      </footer>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-zinc-900/95 border border-purple-500/40 text-white text-xs font-medium rounded-xl shadow-2xl shadow-purple-950/60 backdrop-blur-md animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
