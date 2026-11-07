'use client';

/* Tiny WebAudio synth for kid-friendly game sounds. No assets needed. */

let ctx: AudioContext | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function tone(freq: number, dur = 0.08, type: OscillatorType = 'sine', gain = 0.035, delay = 0) {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = c.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  click() {
    tone(620, 0.05, 'triangle', 0.025);
  },
  confirm() {
    tone(520, 0.07, 'triangle');
    tone(780, 0.09, 'triangle', 0.035, 0.06);
  },
  alert() {
    tone(300, 0.12, 'square', 0.03);
    tone(240, 0.14, 'square', 0.03, 0.13);
  },
  success() {
    tone(523, 0.09, 'triangle');
    tone(659, 0.09, 'triangle', 0.035, 0.08);
    tone(784, 0.14, 'triangle', 0.04, 0.16);
  },
  fail() {
    tone(320, 0.16, 'sawtooth', 0.025);
    tone(200, 0.22, 'sawtooth', 0.025, 0.15);
  },
  launch() {
    tone(180, 0.3, 'sawtooth', 0.02);
    tone(360, 0.25, 'triangle', 0.03, 0.12);
    tone(720, 0.18, 'triangle', 0.035, 0.26);
  },
  tick() {
    tone(900, 0.03, 'sine', 0.015);
  },
};
