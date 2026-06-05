import { useState, useEffect } from "react";
import { Skull, Flame, ShieldAlert, Sparkles, LogIn, Swords, Volume2, VolumeX } from "lucide-react";
// @ts-ignore
import bgImage from "../assets/images/blacklist_bg_1780693070413.png";

interface BlackListGateProps {
  onEnter: () => void;
}

export default function BlackListGate({ onEnter }: BlackListGateProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play synthetic laser/hydraulic door open sound using Web Audio API
  const playOpenSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 1. Deep sub boom
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(80, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);
      gain1.gain.setValueAtTime(0.5, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // 2. High-tech metallic slide (bandpass white noise sweep)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);
      filter.Q.value = 5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.3);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // 3. Cybernetic energy chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start();
      osc1.stop(ctx.currentTime + 1.3);

      noiseNode.start();
      noiseNode.stop(ctx.currentTime + 1.6);

      osc2.start();
      osc2.stop(ctx.currentTime + 1.1);
    } catch (e) {
      console.warn("Audio Context init failed or blocked", e);
    }
  };

  // Play small ambient hum on hover or user gesture
  const triggerAmbientHum = () => {
    if (ambientActive || !soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(55, ctx.currentTime); // low G hum
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setAmbientActive(true);
      setTimeout(() => setAmbientActive(false), 500);
    } catch {}
  };

  const handleOpenGate = () => {
    if (isOpening) return;
    setIsOpening(true);
    playOpenSound();

    // The door slide takes 1.6 seconds, then trigger the callback to load the app
    setTimeout(() => {
      setHasOpened(true);
      onEnter();
    }, 1600);
  };

  return (
    <div className={`fixed inset-0 z-[99999] overflow-hidden flex items-center justify-center font-sans select-none bg-slate-950 transition-all duration-1000 ${hasOpened ? 'pointer-events-none opacity-0 scale-105' : 'opacity-100'}`}>
      
      {/* THE OFFICIAL BLACK LIST GANG SPECIAL BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.22] scale-100 transition-transform duration-[6000ms] ease-out pointer-events-none" 
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* AMBIENT GLOW & PARTICLES BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.8))] pointer-events-none" />
      
      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* LEFT GATE BLADE */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-l from-slate-900 via-slate-950 to-black border-r-4 border-indigo-500/80 transition-transform duration-[1500ms] cubic-bezier(0.77, 0, 0.175, 1) shadow-[10px_0_30px_rgba(99,102,241,0.2)] flex flex-col justify-between items-end p-8 ${
          isOpening ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Metal patterns left side */}
        <div className="text-left w-full h-[30%] opacity-[0.08] flex flex-col justify-start">
          <span className="font-mono text-xs tracking-widest text-indigo-400">BLACK_LIST_SECURE_GATE_L</span>
          <span className="font-mono text-[9px] text-indigo-400">STATUS // SHIELD_ACTIVE_100%</span>
          <span className="font-mono text-[9px] text-indigo-400">ID // BLACKLIST_EST_2026</span>
        </div>

        <div className="my-auto flex flex-col items-end pl-4 border-r-2 border-dashed border-indigo-500/10 pr-4">
          <Skull className="h-16 w-16 text-indigo-500/70 mb-2 animate-pulse" />
          <span className="text-xl font-black text-slate-400 tracking-widest uppercase">BLACK</span>
        </div>

        <div className="w-full text-right text-[10px] text-slate-700 font-mono">
          SECURE ENCRYPTED GATEWAY v4.2 // SYNCED
        </div>
      </div>

      {/* RIGHT GATE BLADE */}
      <div 
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-r from-slate-900 via-slate-950 to-black border-l-4 border-indigo-500/80 transition-transform duration-[1500ms] cubic-bezier(0.77, 0, 0.175, 1) shadow-[-10px_0_30px_rgba(99,102,241,0.2)] flex flex-col justify-between items-start p-8 ${
          isOpening ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Metal patterns right side */}
        <div className="text-right w-full h-[30%] opacity-[0.08] flex flex-col justify-start items-end">
          <span className="font-mono text-xs tracking-widest text-indigo-400">BLACK_LIST_SECURE_GATE_R</span>
          <span className="font-mono text-[9px] text-indigo-400">SERVER // BLACKLIST_COMMUNITY</span>
          <span className="font-mono text-[9px] text-indigo-400">HASH // BLK_RECRUIT_GATE</span>
        </div>

        <div className="my-auto flex flex-col items-start pr-4 border-l-2 border-dashed border-indigo-500/10 pl-4">
          <Swords className="h-16 w-16 text-indigo-500/70 mb-2 animate-pulse" />
          <span className="text-xl font-black text-indigo-500/70 tracking-widest uppercase">LIST</span>
        </div>

        <div className="w-full text-left text-[10px] text-slate-700 font-mono">
          PROTECTED BY S-LEVEL ENCRYPTION
        </div>
      </div>

      {/* CENTER COREFRAME CONTAINER (This stays in the center and is faded out when opening) */}
      <div className={`relative z-10 max-w-2xl px-6 text-center space-y-8 transition-all duration-700 flex flex-col items-center justify-center ${
        isOpening ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}>
        
        {/* TOP GLOWING CRIMINAL SHIELD ELEGANT BADGE */}
        <div className="relative inline-flex mb-2">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-center shadow-2xl">
            <Skull className="h-10 w-10 text-indigo-500 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          </div>
          {/* Flame & Swords badges floating around */}
          <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-amber-500 to-rose-600 p-1.5 rounded-xl border border-amber-400/20 text-white shadow-lg">
            <Flame className="h-4 w-4" />
          </span>
          <span className="absolute -bottom-1 -left-1 bg-indigo-600 p-1.5 rounded-xl border border-indigo-500 text-white shadow-lg">
            <Swords className="h-4 w-4" />
          </span>
        </div>

        {/* WELCOME EMBLEM HEADER TEXTS (ARABIC) */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">بوابة التوظيف الرسمية والتقييم الفني</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
            أهلاً بكم في توظيف <br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500 bg-clip-text text-transparent px-2 font-black">
              BLACKLIST
            </span>
          </h1>

          <div className="max-w-xl mx-auto py-2">
            <p className="text-sm sm:text-base text-indigo-400 font-extrabold leading-relaxed">
              مجتمع في BLACKLIST
            </p>
            <p className="text-xs sm:text-sm text-slate-350 max-w-md mx-auto leading-relaxed mt-2 font-medium">
              بوابتنا المتكاملة لاختبار القبول والتقييم السلوكي وقياس الكفاءة انقر لفتح البوابات لـ BLACKLIST
            </p>
          </div>
        </div>



        {/* CONTROL ACTION BUTTON & AUDIO STATUS MUTE */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          {/* Volume button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title={soundEnabled ? "كتم الصوت المؤقت" : "تفعيل الصوت التفاعلي"}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          {/* Majestic Button to Open the Gate */}
          <button
            onClick={handleOpenGate}
            onMouseEnter={triggerAmbientHum}
            className="flex-1 w-full py-4 text-white font-extrabold rounded-xl text-sm shadow-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-450/40 relative group overflow-hidden transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
          >
            {/* Hover highlight effect */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-sweep"></div>
            
            <div className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5 animate-bounce" />
              <span>انقر لفتح البوابات وتدشين التقييم</span>
            </div>
          </button>
        </div>

        {/* FOOTER CREDITS METRIC */}
        <div className="text-[10px] text-slate-500 font-mono tracking-widest pt-4">
          _BLACKLIST_COMMUNITY // EST. 2026
        </div>

      </div>

      {/* STYLES FOR THE GLOW SWEEP ANIMATION */}
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-150%) skewX(-15deg); }
          50% { transform: translateX(150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        .group-hover\\:animate-sweep:hover {
          animation: sweep 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
