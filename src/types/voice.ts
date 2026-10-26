export interface VoiceStyle {
  id: string;
  name: string;
  category: 'naturel' | 'artistique' | 'studio' | 'futuriste';
  subtitle: string;
  description: string;
  pitch: number; // -12 to +12 semitones
  formantShift: number; // 0.6 to 1.6
  speed: number; // 0.6 to 1.8
  timbreWarmth: number; // 0 to 100
  breathiness: number; // 0 to 100
  reverbType: 'none' | 'studio' | 'chamber' | 'hall' | 'cathedral';
  reverbMix: number; // 0 to 1
  echoTime: number; // 0 to 0.8s
  echoFeedback: number; // 0 to 0.7
  bassGain: number; // -12 to +12 dB
  midGain: number; // -12 to +12 dB
  trebleGain: number; // -12 to +12 dB
  robotMod: boolean;
  robotFreq: number; // 80 to 600 Hz
  chorusMix: number; // 0 to 1
  compression: number; // 0 to 1
  emotion: string;
  accentColor: string;
  sampleScript: string;
}

export interface AudioRecording {
  id: string;
  title: string;
  voiceStyleName: string;
  timestamp: number;
  duration: number;
  url: string;
  blob: Blob;
  sizeBytes: number;
}

export type InputMode = 'tts' | 'mic' | 'file';
export type VisualizerMode = 'bars' | 'wave' | 'orb';

export const MUNIRA_PRESET_STYLES: VoiceStyle[] = [
  {
    id: 'munira-rayonnante',
    name: 'Munira Rayonnante',
    category: 'naturel',
    subtitle: 'Chaleureuse, lumineuse et cristalline',
    description: 'Voix naturelle et bienveillante avec médiums équilibrés et résonance satinée.',
    pitch: 0,
    formantShift: 1.05,
    speed: 1.0,
    timbreWarmth: 65,
    breathiness: 20,
    reverbType: 'studio',
    reverbMix: 0.25,
    echoTime: 0,
    echoFeedback: 0,
    bassGain: 1.5,
    midGain: 2.0,
    trebleGain: 2.5,
    robotMod: false,
    robotFreq: 180,
    chorusMix: 0.15,
    compression: 0.45,
    emotion: 'Joie & Sérénité',
    accentColor: '#38bdf8', // Sky
    sampleScript: "Bonjour ! Je suis Munira. Ma voix porte la lumière et l'énergie d'un nouveau jour."
  },
  {
    id: 'munira-broadcast',
    name: 'Munira Studio Pro',
    category: 'studio',
    subtitle: 'Autorité, clarté radio et présence nette',
    description: 'Compression dynamique broadcast avec accentuation sur la diction et présence vocale 3.2 kHz.',
    pitch: -1,
    formantShift: 0.98,
    speed: 1.05,
    timbreWarmth: 50,
    breathiness: 10,
    reverbType: 'studio',
    reverbMix: 0.12,
    echoTime: 0,
    echoFeedback: 0,
    bassGain: 3.0,
    midGain: 3.5,
    trebleGain: 4.0,
    robotMod: false,
    robotFreq: 220,
    chorusMix: 0,
    compression: 0.85,
    emotion: 'Professionnelle & Assurée',
    accentColor: '#a855f7', // Purple
    sampleScript: "Bienvenue sur les ondes de Munira Studio. Analyse, précision et clarté à chaque instant."
  },
  {
    id: 'munira-conteuse',
    name: 'Munira Conteuse Épique',
    category: 'artistique',
    subtitle: 'Enveloppante, profonde et captivante',
    description: 'Timbre riche en basses feutrées, rythme posé et vaste réverbération évocatrice.',
    pitch: -3,
    formantShift: 0.92,
    speed: 0.88,
    timbreWarmth: 85,
    breathiness: 35,
    reverbType: 'hall',
    reverbMix: 0.42,
    echoTime: 0.18,
    echoFeedback: 0.2,
    bassGain: 4.5,
    midGain: 0.5,
    trebleGain: 1.0,
    robotMod: false,
    robotFreq: 150,
    chorusMix: 0.2,
    compression: 0.4,
    emotion: 'Mystique & Poétique',
    accentColor: '#f59e0b', // Amber
    sampleScript: "Écoutez attentivement... Munira vous emmène par-delà les collines embrumées, là où les légendes prennent vie."
  },
  {
    id: 'munira-asmr',
    name: 'Munira Murmure Intime',
    category: 'naturel',
    subtitle: 'Douceur veloutée, souffle et proximité',
    description: 'Texture feutrée à très courte distance, sensation binaurale et atténuation des crêtes.',
    pitch: 1,
    formantShift: 1.1,
    speed: 0.85,
    timbreWarmth: 75,
    breathiness: 90,
    reverbType: 'chamber',
    reverbMix: 0.35,
    echoTime: 0.08,
    echoFeedback: 0.15,
    bassGain: 1.0,
    midGain: -1.0,
    trebleGain: 3.0,
    robotMod: false,
    robotFreq: 200,
    chorusMix: 0.3,
    compression: 0.6,
    emotion: 'Calme & Intimité',
    accentColor: '#ec4899', // Pink
    sampleScript: "Chut... Fermez les yeux. Respirez doucement avec Munira. Tout est paisible autour de vous."
  },
  {
    id: 'munira-cyber',
    name: 'Munira Cyber Vocoder',
    category: 'futuriste',
    subtitle: 'Harmoniseur robotique et synthèse néon',
    description: 'Modulation en anneau, résonateur synthétique et panoramique stéréo futuriste.',
    pitch: 0,
    formantShift: 1.25,
    speed: 1.1,
    timbreWarmth: 20,
    breathiness: 0,
    reverbType: 'cathedral',
    reverbMix: 0.5,
    echoTime: 0.26,
    echoFeedback: 0.45,
    bassGain: 2.0,
    midGain: -2.0,
    trebleGain: 6.0,
    robotMod: true,
    robotFreq: 310,
    chorusMix: 0.7,
    compression: 0.9,
    emotion: 'Futuriste & Électro',
    accentColor: '#06b6d4', // Cyan
    sampleScript: "Protocole Munira initialisé. Fréquence quantique stabilisée à 432 hertz. Transmission démarrée."
  },
  {
    id: 'munira-petillante',
    name: 'Munira Pétillante & Jeune',
    category: 'naturel',
    subtitle: 'Tonique, enthousiaste et espiègle',
    description: 'Pitch rehaussé, formants aériens, débit rapide et saturation analogique chaleureuse.',
    pitch: 4,
    formantShift: 1.3,
    speed: 1.18,
    timbreWarmth: 40,
    breathiness: 15,
    reverbType: 'studio',
    reverbMix: 0.18,
    echoTime: 0,
    echoFeedback: 0,
    bassGain: -2.0,
    midGain: 2.5,
    trebleGain: 4.5,
    robotMod: false,
    robotFreq: 240,
    chorusMix: 0.1,
    compression: 0.5,
    emotion: 'Enthousiasme & Énergie',
    accentColor: '#10b981', // Emerald
    sampleScript: "Coucou ! C'est Munira ! Vous êtes prêts pour une aventure extraordinaire aujourd'hui ?"
  },
  {
    id: 'munira-theatrale',
    name: 'Munira Théâtre & Lyrique',
    category: 'artistique',
    subtitle: 'Grande projection, vibrato et dramaturgie',
    description: 'Inflexions dramatiques poussées, projection articulée et résonance de scène lyrique.',
    pitch: 2,
    formantShift: 1.12,
    speed: 0.95,
    timbreWarmth: 70,
    breathiness: 25,
    reverbType: 'cathedral',
    reverbMix: 0.45,
    echoTime: 0.15,
    echoFeedback: 0.25,
    bassGain: 2.0,
    midGain: 4.0,
    trebleGain: 3.0,
    robotMod: false,
    robotFreq: 190,
    chorusMix: 0.35,
    compression: 0.7,
    emotion: 'Dramatique & Solennelle',
    accentColor: '#e11d48', // Rose
    sampleScript: "Le silence se brise, et le nom de Munira s'élève, vibrant d'un éclat immortel devant l'assemblée !"
  }
];

export const MUNIRA_SAMPLE_SCRIPTS = [
  {
    label: "Présentation Iconique",
    text: "Bonjour, je m'appelle Munira, et voici ma voix transformée et personnalisée."
  },
  {
    label: "Étymologie & Poésie",
    text: "Munira, ce nom signifie source de lumière, clarté qui guide et réchauffe les cœurs."
  },
  {
    label: "Message de Bienvenue Studio",
    text: "Bienvenue dans le Studio Vocal Munira. Ajustez le pitch, le timbre et la réverbération pour façonner mon expression."
  },
  {
    label: "Transmission Stellaire",
    text: "Ici l'agent Munira en orbite géostationnaire. Réception limpide, modules acoustiques parfaitement accordés."
  },
  {
    label: "Méditation & Sérénité",
    text: "Respirez en profondeur. Avec Munira, relâchez chaque tension et laissez cette voix apaiser vos pensées."
  }
];
