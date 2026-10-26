import React, { useEffect, useRef } from 'react';
import { VisualizerMode } from '../types/voice';
import { audioEngine } from '../services/audioEngine';

interface VisualizerProps {
  mode: VisualizerMode;
  isActive: boolean;
  accentColor?: string;
  styleName?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  mode,
  isActive,
  accentColor = '#a855f7',
  styleName = 'Munira Rayonnante'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const peakHoldRef = useRef<number[]>(new Array(48).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let analyser = audioEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);
    const timeArray = new Uint8Array(bufferLength);

    let phase = 0;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark canvas clear with gentle persistence for motion trail
      ctx.fillStyle = 'rgba(8, 9, 13, 0.35)';
      ctx.fillRect(0, 0, width, height);

      analyser = audioEngine.getAnalyser();

      let hasRealAudio = false;
      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(timeArray);
        for (let i = 0; i < 20; i++) {
          if (dataArray[i] > 10) {
            hasRealAudio = true;
            break;
          }
        }
      }

      phase += 0.04;

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (mode === 'bars') {
        const barCount = 42;
        const totalBarWidth = width / barCount;
        const barWidth = totalBarWidth * 0.72;
        const gap = totalBarWidth * 0.28;

        for (let i = 0; i < barCount; i++) {
          let value = 0;
          if (hasRealAudio) {
            const index = Math.floor((i / barCount) * (bufferLength * 0.65));
            value = (dataArray[index] / 255);
          } else if (isActive) {
            // Simulated rhythmic pulse
            value = (Math.sin(phase * 1.5 + i * 0.2) * 0.2 + 0.35 + Math.sin(phase * 3 + i * 0.5) * 0.15);
          } else {
            // Ambient idle breathing
            value = 0.04 + Math.sin(phase * 0.6 + i * 0.15) * 0.03;
          }

          const barHeight = Math.max(3, value * (height - 20));
          const x = i * (barWidth + gap) + gap / 2;
          const y = height - barHeight - 8;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, `${accentColor}33`);
          grad.addColorStop(0.6, accentColor);
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Peak caps
          if (!peakHoldRef.current[i]) peakHoldRef.current[i] = 0;
          if (barHeight > peakHoldRef.current[i]) {
            peakHoldRef.current[i] = barHeight;
          } else {
            peakHoldRef.current[i] = Math.max(0, peakHoldRef.current[i] - 1.2);
          }

          const peakY = height - peakHoldRef.current[i] - 10;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(4, peakY), barWidth, 2);
        }
      } else if (mode === 'wave') {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = isActive ? 12 : 4;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = 0;
          if (hasRealAudio) {
            v = (timeArray[i] / 128.0) - 1.0;
          } else if (isActive) {
            v = Math.sin(phase * 2.5 + i * 0.1) * 0.35 + Math.sin(phase * 4 + i * 0.25) * 0.15;
          } else {
            v = Math.sin(phase + i * 0.08) * 0.06;
          }

          const y = (height / 2) + v * (height * 0.42);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Secondary softer harmonic wave for depth
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          let v = 0;
          if (hasRealAudio) {
            v = -((timeArray[i] / 128.0) - 1.0) * 0.7;
          } else {
            v = Math.cos(phase * 1.8 + i * 0.1) * (isActive ? 0.25 : 0.04);
          }
          const y = (height / 2) + v * (height * 0.35);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      } else if (mode === 'orb') {
        const centerX = width / 2;
        const centerY = height / 2;
        let avgEnergy = 0;

        if (hasRealAudio) {
          let sum = 0;
          for (let i = 0; i < 30; i++) sum += dataArray[i];
          avgEnergy = sum / 30 / 255;
        } else if (isActive) {
          avgEnergy = 0.4 + Math.sin(phase * 2) * 0.25;
        } else {
          avgEnergy = 0.08 + Math.sin(phase * 0.8) * 0.04;
        }

        const baseRadius = Math.min(width, height) * 0.22;
        const radius = baseRadius + avgEnergy * 32;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.4, centerX, centerY, radius * 1.8);
        glowGrad.addColorStop(0, `${accentColor}55`);
        glowGrad.addColorStop(0.5, `${accentColor}15`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing circular wave ring
        const points = 48;
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise = hasRealAudio 
            ? (dataArray[i % 20] / 255) * 22
            : Math.sin(angle * 5 + phase * 3) * (avgEnergy * 14);
          const r = radius + noise;
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `${accentColor}25`;
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner glowing core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.6);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, accentColor);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mode, isActive, accentColor]);

  return (
    <div className="relative w-full h-44 md:h-52 bg-[#0d0f17] rounded-xl overflow-hidden border border-zinc-800/80">
      <canvas
        ref={canvasRef}
        width={800}
        height={220}
        className="w-full h-full block"
      />
      {/* Overlay indicator */}
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Modèle Vocal : <strong className="text-zinc-200 font-semibold">{styleName}</strong>
        </span>
        <span className="text-zinc-600">·</span>
        <span className="text-xs font-mono text-zinc-400 tabular-nums">
          {isActive ? 'ÉMISSION ACTIVE' : 'VEILLE STUDIO'}
        </span>
      </div>

      <div className="absolute top-3 right-4 pointer-events-none">
        <span className="text-xs font-mono text-zinc-400">
          DSP 48kHz · 24-bit
        </span>
      </div>
    </div>
  );
};
