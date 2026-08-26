'use client'

import React from 'react'
import { Hammer, Anchor, Settings, Drill, AlertTriangle } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated Icon Cluster */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20 scale-150" />
          <div className="bg-slate-900 border-2 border-red-600 p-8 rounded-full relative">
            <Anchor className="w-16 h-16 text-white animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-red-600 p-2 rounded-full border-4 border-slate-950">
              <Settings className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4 uppercase">
          Vessels <span className="text-red-600">SHIPNOW</span>
        </h1>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-slate-800" />
          <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.4em]">
            Page Maintenance in progress
          </p>
          <div className="h-px w-12 bg-slate-800" />
        </div>

        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-10 font-medium">
          This page is currently undergoing scheduled maintenance to ensure peak fleet performance. We will be back online and tracking shortly.
        </p>

        {/* Maintenance Progress Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-full h-4 max-w-sm mx-auto overflow-hidden p-1">
          <div className="h-full bg-red-600 rounded-full animate-progress" style={{ width: '65%' }} />
        </div>
        <p className="mt-3 text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest">
          Update Progress: 65%
        </p>

        {/* Footer Link (Optional) 
        <div className="mt-16 pt-8 border-t border-slate-900">
          <button 
            onClick={() => window.location.reload()}
            className="group flex items-center gap-2 mx-auto text-xs font-black uppercase text-slate-400 hover:text-white transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-red-600 group-hover:animate-bounce" />
            Connection
          </button>
        </div>
        */}
      </div>

      {/* Tailwind Custom Animation for Progress Bar (Add to tailwind.config.js or globals.css if needed) */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 65%; }
        }
        .animate-progress {
          animation: progress 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}