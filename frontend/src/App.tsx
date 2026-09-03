import React from 'react';
import { GraduationCap, ShieldCheck, Server, Layers } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 text-emerald-400">
          <GraduationCap className="w-10 h-10" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Final Year Project Management System
          </h1>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed">
          Welcome to the official online platform for Ho Technical University.
          Digitizing topic selection, supervisor allocation, chapter reviews, multi-evaluator defense scoring, and departmental exports.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Server className="w-4 h-4" />
              <span>Laravel 11 Backend</span>
            </div>
            <p className="text-xs text-slate-400">
              REST API, Sanctum Auth, Horizon Queues & Spatie RBAC.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>React 18 SPA</span>
            </div>
            <p className="text-xs text-slate-400">
              Vite, TypeScript, Tailwind CSS, TanStack Query & Zustand.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Docker Architecture</span>
            </div>
            <p className="text-xs text-slate-400">
              MySQL 8, Redis 7, Soketi WebSockets & Mailpit.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Ho Technical University · 2026</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
            Phase 1 Setup Active
          </span>
        </div>
      </div>
    </div>
  );
}
