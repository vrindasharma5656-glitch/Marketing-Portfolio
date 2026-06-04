'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { ArrowLeft, Download } from 'lucide-react';
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
  created_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [projRes, catRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', params.id).maybeSingle(),
        supabase.from('categories').select('*'),
      ]);
      if (projRes.data) setProject(projRes.data);
      setCategories(catRes.data || []);
      setLoading(false);
    }
    if (params.id) loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light">Project not found</h1>
          <Link href="/" className="text-accent hover:underline mt-4 inline-block">Return home</Link>
        </div>
      </div>
    );
  }

  const projectCategories = categories.filter((c) => project.category_ids.includes(c.id));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 animate-fade-in-up">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          {projectCategories.map((cat) => (
            <Badge key={cat.id} variant="outline" className="text-xs">{cat.name}</Badge>
          ))}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight">{project.title}</h1>

        <Separator className="my-8" />

        {project.images.length > 0 && (
          <div className="mb-10">
            <Carousel opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {project.images.map((url, i) => (
                  <CarouselItem key={i}>
                    <div className="relative overflow-hidden rounded-xl bg-muted">
                      <img src={url} alt={`${project.title} - Image ${i + 1}`} className="w-full max-h-[500px] object-contain" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {project.images.length > 1 && (
                <>
                  <CarouselPrevious className="-left-4" />
                  <CarouselNext className="-right-4" />
                </>
              )}
            </Carousel>
            {project.images.length > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-3 font-light">{project.images.length} images</p>
            )}
          </div>
        )}

        <div className="max-w-3xl">
          <p className="text-lg text-muted-foreground leading-relaxed font-light whitespace-pre-wrap">{project.description}</p>
        </div>

        {project.pdf_url && (
          <div className="mt-10">
            <a href={project.pdf_url} target="_blank" rel="noopener noreferrer" download>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Download PDF Report
              </Button>
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
