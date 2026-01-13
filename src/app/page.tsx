'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Github,
  Info,
  Code2,
  Zap,
  ChevronRight,
  Lightbulb
} from 'lucide-react';

// --- Types ---
type SortType = 'compare' | 'swap' | 'sorted' | 'init' | 'complete';

interface SortingStep {
  array: number[];
  indices: number[];
  type: SortType;
  description: string;
  codeLine?: number;
}

// --- Constants ---
const ARRAY_SIZE = 10;
const INITIAL_SPEED = 500;

const CODE_PYTHON = [
  "def bubble_sort(arr):",
  "    n = len(arr)",
  "    for i in range(n):",
  "        for j in range(0, n - i - 1):",
  "            if arr[j] > arr[j + 1]:",
  "                arr[j], arr[j + 1] = arr[j + 1], arr[j]"
];

// --- Algorithm Logic ---
const generateSteps = (initialArray: number[]): SortingStep[] => {
  const steps: SortingStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;

  steps.push({
    array: [...arr],
    indices: [],
    type: 'init',
    description: 'ランダムな配列を生成しました。さあ、並び替えを開始しましょう！',
    codeLine: 0
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare
      steps.push({
        array: [...arr],
        indices: [j, j + 1],
        type: 'compare',
        description: `インデックス ${j} (${arr[j]}) と ${j + 1} (${arr[j + 1]}) を比較します。`,
        codeLine: 4
      });

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          array: [...arr],
          indices: [j, j + 1],
          type: 'swap',
          description: `${arr[j + 1]} の方が大きいので、右側（後ろ）へ移動（バブルアップ）させます。`,
          codeLine: 5
        });
      }
    }
    // Sorted
    const sortedIndices = Array.from({ length: i + 1 }, (_, k) => n - 1 - k);
    steps.push({
      array: [...arr],
      indices: sortedIndices,
      type: 'sorted',
      description: `配列の末尾に最大値 ${arr[n - i - 1]} が固定されました。`,
      codeLine: 2
    });
  }

  steps.push({
    array: [...arr],
    indices: Array.from({ length: n }, (_, k) => k),
    type: 'complete',
    description: 'すべての要素が正しく並び替えられました！',
    codeLine: 0
  });

  return steps;
};

// --- Main Component ---
export default function SortingStudio() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 90) + 10);
    const newSteps = generateSteps(newArray);
    setArray(newArray);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 - speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  const step = steps[currentStep] || { array: [], indices: [], type: 'init', description: '' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="text-slate-950 w-5 h-5 fill-current" />
            </div>
            <h1 className="font-black italic tracking-tighter text-xl uppercase">Sorting_Lab</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-[10px] mono uppercase text-slate-500">
              <span>Status:</span>
              <span className={isPlaying ? 'text-emerald-400' : 'text-amber-400'}>
                {isPlaying ? 'Computing' : 'Paused'}
              </span>
            </div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Visualization & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Visualizer Area */}
          <div className="relative aspect-video lg:aspect-square max-h-[500px] bg-slate-900/50 rounded-3xl border border-white/5 p-12 flex items-end justify-center gap-2 overflow-hidden group">
            <div className="absolute top-6 left-6 flex items-center gap-2 mono text-[10px] text-slate-500 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Live Visualization
            </div>

            <AnimatePresence mode="popLayout">
              {step.array.map((val, idx) => {
                const isTarget = step.indices.includes(idx);
                let colorClass = "bg-slate-700";

                if (isTarget) {
                  if (step.type === 'compare') colorClass = "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]";
                  if (step.type === 'swap') colorClass = "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]";
                  if (step.type === 'sorted') colorClass = "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]";
                  if (step.type === 'complete') colorClass = "bg-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)]";
                }

                return (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    style={{ height: `${val}%` }}
                    className={`flex-1 min-w-[30px] rounded-t-lg relative ${colorClass} transition-colors duration-200`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 mono text-xs font-bold text-slate-400">
                      {val}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Reflection grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          {/* Controls Bar */}
          <div className="p-8 bg-slate-900/80 rounded-3xl border border-white/10 flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <StepBack size={20} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-white text-slate-950 rounded-2xl flex items-center justify-center hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-cyan-500/10"
                >
                  {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
                <button
                  onClick={stepForward}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <StepForward size={20} />
                </button>
                <button
                  onClick={reset}
                  className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors ml-2"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex-1 max-w-xs px-8">
                <div className="flex items-center justify-between mono text-[10px] text-slate-500 mb-2 uppercase tracking-widest">
                  <span>Playback Speed</span>
                  <span className="text-cyan-400">{Math.round((speed / 980) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="980"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full appearance-none bg-slate-800 h-1.5 rounded-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex items-start gap-4">
              <div className="mt-1 p-2 bg-slate-800 rounded-lg shrink-0">
                <Info size={16} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {step.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Code & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-8">

          {/* Theory Card */}
          <div className="p-8 bg-zinc-900 border border-white/5 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="text-amber-400 w-5 h-5" />
              <h2 className="font-bold text-sm uppercase tracking-widest">Algorithm Index</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                <h3 className="text-cyan-400 font-bold mb-2">バブルソート</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  隣り合う要素を比較し、順序が逆であれば入れ替える作業を繰り返します。
                  大きな値が右端へ「泡」のように上がっていく様子からこの名前がつきました。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mono text-[10px] uppercase">
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-500 block mb-1">Complexity</span>
                  <span className="text-white">O(n²)</span>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl">
                  <span className="text-slate-500 block mb-1">State</span>
                  <span className="text-white">{currentStep} / {steps.length - 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Card */}
          <div className="p-8 bg-black border border-white/5 rounded-3xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-400 w-5 h-5" />
                <h2 className="font-bold text-sm uppercase tracking-widest">Python Implementation</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" />
            </div>

            <div className="flex-1 bg-zinc-950/50 p-6 rounded-2xl mono text-[11px] leading-loose overflow-auto border border-white/5">
              {CODE_PYTHON.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-6 transition-colors duration-200 ${step.codeLine === i ? 'text-cyan-400 bg-cyan-400/10 -mx-6 px-6 border-l-2 border-cyan-400' : 'text-slate-600'}`}
                >
                  <span className="text-slate-800 tabular-nums select-none w-4">{i + 1}</span>
                  <pre className={`whitespace-pre ${step.codeLine === i ? 'text-cyan-100 font-bold' : ''}`}>{line}</pre>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] mono text-slate-500 uppercase">
              <span>Python 3.12</span>
              <span>BubbleSort.py</span>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="mt-20 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] mono text-slate-600 uppercase tracking-widest">
            Developed for Informatics I // Educational Sandbox
          </p>
          <div className="flex items-center gap-8 mono text-[10px] text-slate-500 uppercase">
            <span className="hover:text-cyan-400 pointer-events-none transition-colors">Documentation</span>
            <span className="hover:text-cyan-400 pointer-events-none transition-colors">Privacy</span>
            <span className="hover:text-cyan-400 pointer-events-none transition-colors">License: MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
