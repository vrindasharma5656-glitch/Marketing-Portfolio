'use client';

import { ArrowUpRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(168,58%,28%)] via-[hsl(168,40%,22%)] to-[hsl(0,0%,9%)]" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }}
      />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/80 tracking-wide">Available for projects</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight text-white tracking-tight leading-[1.1]">
            Strategy that<br />
            <span className="font-light italic">moves</span> markets
          </h1>
          <p className="mt-8 text-lg text-white/60 max-w-xl leading-relaxed font-light">
            Marketing portfolio showcasing brand strategy, digital campaigns, and creative direction that delivers measurable impact.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/vrinda-sharma-5a3a2926a/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[hsl(168,58%,28%)] rounded-lg text-sm font-medium hover:bg-white/90 transition-all hover:gap-3"
            >
              Connect on LinkedIn
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-lg text-sm font-light hover:bg-white/5 transition-all"
            >
              View Work
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
