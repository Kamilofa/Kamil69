import React, { useState } from 'react';
import { AudioRecording } from '../types/voice';
import { Disc, Download, Trash2, Play, Square, Clock, Music } from 'lucide-react';

interface AudioRecordingsListProps {
  recordings: AudioRecording[];
  onDeleteRecording: (id: string) => void;
}

export const AudioRecordingsList: React.FC<AudioRecordingsListProps> = ({
  recordings,
  onDeleteRecording
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayToggle = (rec: AudioRecording) => {
    if (playingId === rec.id && currentAudio) {
      currentAudio.pause();
      setPlayingId(null);
      setCurrentAudio(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(rec.url);
    audio.play();
    setPlayingId(rec.id);
    setCurrentAudio(audio);

    audio.onended = () => {
      setPlayingId(null);
      setCurrentAudio(null);
    };
  };

  const handleDownload = (rec: AudioRecording) => {
    const a = document.createElement('a');
    a.href = rec.url;
    a.download = `${rec.title.replace(/\s+/g, '_').toLowerCase()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (recordings.length === 0) {
    return (
      <div className="p-12 text-center bg-[#11131c] rounded-xl border border-zinc-800 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Disc className="w-6 h-6 text-zinc-600" />
        </div>
        <h3 className="text-base font-semibold text-white">Aucun Enregistrement Vocal</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Déclenchez le bouton « Capturer la Prise » dans le Studio Vocal pour sauvegarder vos métamorphoses vocales de Munira.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Prises & Enregistrements Studio
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {recordings.length} prise{recordings.length > 1 ? 's' : ''} audio sauvegardée{recordings.length > 1 ? 's' : ''} dans cette session.
          </p>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/80 bg-[#11131c] rounded-xl border border-zinc-800 overflow-hidden">
        {recordings.map((rec) => {
          const isPlaying = playingId === rec.id;
          const formattedDate = new Date(rec.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          return (
            <div
              key={rec.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#151724] transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayToggle(rec)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">
                    {rec.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
                    <span>{rec.voiceStyleName}</span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="tabular-nums">{rec.duration}s</span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="tabular-nums">{formattedDate}</span>
                    <span aria-hidden="true" className="text-zinc-600">·</span>
                    <span className="tabular-nums">{(rec.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleDownload(rec)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
                  title="Télécharger le fichier audio"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Télécharger</span>
                </button>

                <button
                  onClick={() => onDeleteRecording(rec.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Supprimer la prise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
