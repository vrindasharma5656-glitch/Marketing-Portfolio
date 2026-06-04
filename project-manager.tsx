'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/admin-auth';
import { getProjects, getCategories, deleteProject, createProject, deleteFile, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Upload, X, Image, FileText, Loader2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  pdf_url: string | null;
  category_ids: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export function ProjectManager() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [projData, catData] = await Promise.all([getProjects(token), getCategories(token)]);
      setProjects(projData || []);
      setCategories(catData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error loading data', description: msg, variant: 'destructive' });
    }
    setLoading(false);
  }, [token, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (project: Project) => {
    if (!token || !confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      for (const imgUrl of project.images) {
        const path = imgUrl.split('/portfolio/')[1];
        if (path) await deleteFile(path, token).catch(() => {});
      }
      if (project.pdf_url) {
        const path = project.pdf_url.split('/portfolio/')[1];
        if (path) await deleteFile(path, token).catch(() => {});
      }
      await deleteProject(token, project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast({ title: 'Project deleted' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your portfolio projects</p>
        </div>
        <Button onClick={() => setShowCreator(!showCreator)} className="gap-2">
          {showCreator ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreator ? 'Cancel' : 'New Project'}
        </Button>
      </div>

      {showCreator && (
        <ProjectCreator categories={categories} token={token!} onCreated={() => { setShowCreator(false); loadData(); }} />
      )}

      <Separator />

      {projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No projects yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id} className="animate-fade-in">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {project.images.length > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Image className="h-3 w-3" /> {project.images.length} image{project.images.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {project.pdf_url && (
                      <Badge variant="secondary" className="gap-1">
                        <FileText className="h-3 w-3" /> PDF
                      </Badge>
                    )}
                    {project.category_ids.map((cid) => {
                      const cat = categories.find((c) => c.id === cid);
                      return cat ? <Badge key={cid} variant="outline" className="text-xs">{cat.name}</Badge> : null;
                    })}
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(project)} className="shrink-0 gap-1">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCreator({ categories, token, onCreated }: { categories: Category[]; token: string; onCreated: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const url = await uploadFile(file, 'projects');
        setUploadedImages((prev) => [...prev, url]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
      }
    }
    e.target.value = '';
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'documents');
      setPdfUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast({ title: 'PDF upload failed', description: msg, variant: 'destructive' });
    }
    e.target.value = '';
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await createProject(token, {
        title: title.trim(),
        description: description.trim(),
        images: uploadedImages,
        pdf_url: pdfUrl || undefined,
        category_ids: selectedCategories,
      });
      toast({ title: 'Project created' });
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed';
      toast({ title: 'Failed to create project', description: msg, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-lg font-light">Create New Project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Title</label>
          <Input placeholder="Enter project title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea placeholder="Describe the project..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category Tags</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox id={`cat-${cat.id}`} checked={selectedCategories.includes(cat.id)} onCheckedChange={() => toggleCategory(cat.id)} />
                <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">{cat.name}</label>
              </div>
            ))}
          </div>
          {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet. Create some in the Tags tab.</p>}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Project Images</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload images</p>
            <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border">
                  <img src={url} alt={`Upload ${i + 1}`} className="w-full h-24 object-cover" />
                  <button onClick={() => setUploadedImages((prev) => prev.filter((u) => u !== url))} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Case Study PDF</label>
          {pdfUrl ? (
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-accent" />
              <span className="text-sm flex-1 truncate">PDF uploaded</span>
              <Button variant="ghost" size="sm" onClick={() => setPdfUrl(null)} className="gap-1">
                <X className="h-3 w-3" /> Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('pdf-upload')?.click()}>
              <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload case study PDF</p>
              <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving || !title.trim()} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving ? 'Creating...' : 'Create Project'}
        </Button>
      </CardContent>
    </Card>
  );
}
