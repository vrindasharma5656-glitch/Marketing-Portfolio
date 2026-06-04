'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  pdf_url: string | null;
  category_ids: string[];
}

export function WorkSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [catRes, projRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
      ]);
      setCategories(catRes.data || []);
      setProjects(projRes.data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProjects = activeFilter
    ? projects.filter((p) => p.category_ids.includes(activeFilter))
    : projects;

  if (loading) {
    return (
      <section id="work" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-24 bg-muted rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight animate-fade-in">
            Selected Work
          </h2>
          <p className="text-muted-foreground mt-3 font-light animate-fade-in-up">
            A curated collection of projects across disciplines
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all border ${
                activeFilter === null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent border-border hover:border-primary/30 text-foreground'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(activeFilter === cat.id ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${
                  activeFilter === cat.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent border-border hover:border-primary/30 text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-light">No projects to display yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="group cursor-pointer overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  {project.images.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-medium group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-light">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {project.category_ids.map((cid) => {
                        const cat = categories.find((c) => c.id === cid);
                        return cat ? (
                          <Badge key={cid} variant="outline" className="text-xs font-light">
                            {cat.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <div className="mt-4 flex items-center text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      View Details <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
