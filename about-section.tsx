'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AboutData {
  headline: string;
  biography: string;
  photo_url: string | null;
}

export function AboutSection() {
  const [about, setAbout] = useState<AboutData | null>(null);

  useEffect(() => {
    supabase.from('about').select('*').limit(1).then(({ data }) => {
      if (data && data.length > 0) setAbout(data[0]);
    });
  }, []);

  if (!about) return null;

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 flex justify-center lg:justify-end">
            {about.photo_url ? (
              <div className="relative animate-fade-in">
                <div className="absolute -inset-3 bg-accent/10 rounded-2xl rotate-3" />
                <img
                  src={about.photo_url}
                  alt="Profile"
                  className="relative h-72 w-72 rounded-2xl object-cover shadow-xl"
                />
              </div>
            ) : (
              <div className="h-72 w-72 rounded-2xl bg-muted flex items-center justify-center">
                <span className="text-6xl font-extralight text-muted-foreground">?</span>
              </div>
            )}
          </div>
          <div className="lg:col-span-3 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">
              {about.headline}
            </h2>
            <div className="w-16 h-0.5 bg-accent mt-6 mb-6" />
            <p className="text-muted-foreground leading-relaxed font-light text-lg">
              {about.biography}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
