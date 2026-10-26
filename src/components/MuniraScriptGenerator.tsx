import React, { useState } from 'react';
import { VoiceStyle } from '../types/voice';
import { Sparkles, Play, Copy, Check, BookOpen, Send, Wand2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface MuniraScriptGeneratorProps {
  currentStyle: VoiceStyle;
  onSendToStudio: (text: string) => void;
  onPlayScript: (text: string) => void;
}

const THEMES = [
  { id: 'poetique', label: 'Poétique & Solaire', prompt: 'Une réplique poétique et lumineuse sur la signification du nom Munira (qui signifie source de lumière), touchante et émouvante.' },
  { id: 'cinematique', label: 'Bande-Annonce Épique', prompt: 'Une réplique dramatique et mystique de bande-annonce de film fantastique mettant en valeur le nom Munira.' },
  { id: 'podcast', label: 'Intro Podcast Studio', prompt: 'Une introduction de podcast dynamique, chaleureuse et moderne présentée par Munira.' },
  { id: 'cyberpunk', label: 'Transmission Cyberpunk', prompt: 'Un message radio futuriste crypté dans un univers cyberpunk énoncé par l\'agent Munira.' },
  { id: 'meditation', label: 'Relaxation & Bienveillance', prompt: 'Une phrase apaisante de méditation guidée réconfortante énoncée avec douceur par Munira.' }
];

const CURATED_SCRIPTS: Record<string, string[]> = {
  poetique: [
    "Munira... Dans l'ombre des nuits sans étoiles, ce nom s'élève comme la première lueur de l'aube sur les toits d'Orient.",
    "Je porte le nom de Munira, et avec chaque souffle, je répands la clarté là où régnait le doute.",
    "Écoutez le murmure du vent : il prononce Munira, et les eaux calmes du lac se parent de reflets d'or."
  ],
  cinematique: [
    "Ils croyaient le royaume perdu à jamais. Mais lorsque la bannière de Munira franchit la muraille, l'espoir renaquit.",
    "Ne craignez point la tempête qui gronde. Car au cœur du tumulte se dresse Munira, gardienne des flammes éternelles.",
    "Voici l'instant décisif : le serment de Munira scellera le destin de notre monde."
  ],
  podcast: [
    "Bienvenue dans votre rendez-vous hebdomadaire ! Je suis Munira, et aujourd'hui nous explorons les frontières du son.",
    "Ici Munira en direct des studios. Installez-vous confortablement, nous décollons pour une heure d'immersion totale.",
    "Bonjour à toutes et à tous, Munira à l'antenne pour décrypter les plus belles innovations de notre époque !"
  ],
  cyberpunk: [
    "Alerte intrusion sur le secteur 7. Munira bascule le réseau neuronal en mode furtif. Fréquences verrouillées.",
    "Munira au rapport. Les néons de la mégalopole s'éteignent un à un. Préparez la synchronisation des condensateurs.",
    "Matrice vocale Munira chargée à 100%. Aucune distorsion détectée dans le flux de données quantiques."
  ],
  meditation: [
    "Posez les mains sur votre cœur. Laissez la voix de Munira guider votre respiration vers un havre de paix.",
    "Chaque expiration libère les tensions. Avec Munira, accordez-vous ce moment précieux de calme absolu.",
    "Le monde peut attendre un instant. Écoutez le rythme paisible de vos battements, guidé par Munira."
  ]
};

export const MuniraScriptGenerator: React.FC<MuniraScriptGeneratorProps> = ({
  currentStyle,
  onSendToStudio,
  onPlayScript
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('poetique');
  const [generatedScript, setGeneratedScript] = useState<string>(CURATED_SCRIPTS.poetique[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const themeObj = THEMES.find(t => t.id === selectedTheme);
    const promptInstructions = themeObj?.prompt || THEMES[0].prompt;

    try {
      // Check if GEMINI_API_KEY is available in browser / env
      const apiKey = (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY || 
                     (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
                     (import.meta as unknown as { env: Record<string, string> }).env?.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Tu es un scénariste vocal et auteur professionnel. Génère UNE SEULE réplique en français, très expressive, poignante et bien rythmée, mettant impérativement en valeur le prénom "Munira". Longueur : 1 à 2 phrases percutantes. Contexte demandé : ${promptInstructions}. Réponds uniquement avec le texte de la réplique entre guillemets, sans aucun commentaire supplémentaire.`
        });

        const text = response.text ? response.text.replace(/^["']|["']$/g, '').trim() : '';
        if (text) {
          setGeneratedScript(text);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Gemini API not reachable directly, fallback to curated library", err);
    }

    // High quality instant curated fallback
    const list = CURATED_SCRIPTS[selectedTheme] || CURATED_SCRIPTS.poetique;
    const nextText = list[Math.floor(Math.random() * list.length)];
    setGeneratedScript(nextText);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Générateur de Répliques Expressives « Munira »
            </h2>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Création de textes et tirades poétiques, cinématographiques ou radiophoniques mettant en valeur le nom Munira.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Wand2 className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Composition...' : 'Générer une Nouvelle Réplique'}</span>
        </button>
      </div>

      {/* Theme selection buttons */}
      <div className="flex flex-wrap gap-2">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => {
              setSelectedTheme(theme.id);
              const list = CURATED_SCRIPTS[theme.id];
              if (list) setGeneratedScript(list[0]);
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              selectedTheme === theme.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
            }`}
          >
            {theme.label}
          </button>
        ))}
      </div>

      {/* Script Display & Controls */}
      <div className="p-6 bg-[#11131c] rounded-xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>RÉPLIQUE PROPOSÉE POUR MUNIRA</span>
          <span>Style actuel : <strong className="text-purple-300 font-sans">{currentStyle.name}</strong></span>
        </div>

        <div className="p-5 bg-[#090A0F] rounded-lg border border-zinc-800/80 text-zinc-100 text-base md:text-lg leading-relaxed font-sans italic selection:bg-purple-600">
          « {generatedScript} »
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlayScript(generatedScript)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Auditionner dans le Studio</span>
            </button>

            <button
              onClick={() => onSendToStudio(generatedScript)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-zinc-400" />
              <span>Envoyer vers l'Éditeur</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié dans le presse-papier' : 'Copier le texte'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
