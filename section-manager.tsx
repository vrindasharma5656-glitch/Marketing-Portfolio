'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/admin-auth';
import { getSections, updateSection, deleteSection } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Section {
  id: string;
  section_key: string;
  section_label: string;
  visible: boolean;
  sort_order: number;
}

export function SectionManager() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getSections(token);
      setSections(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error loading sections', description: msg, variant: 'destructive' });
    }
    setLoading(false);
  }, [token, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (section: Section) => {
    if (!token) return;
    const newVisible = !section.visible;
    try {
      await updateSection(token, section.id, { visible: newVisible });
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, visible: newVisible } : s)));
      toast({ title: `${section.section_label} ${newVisible ? 'shown' : 'hidden'}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle failed';
      toast({ title: 'Toggle failed', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (section: Section) => {
    if (!token || !confirm(`Remove "${section.section_label}" section from the homepage?`)) return;
    try {
      await deleteSection(token, section.id);
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      toast({ title: 'Section removed' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light tracking-tight">Layout Sections</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Control which sections appear on your homepage</p>
      </div>
      {sections.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <EyeOff className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No sections configured.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <Card key={section.id} className="animate-fade-in">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {section.visible ? <Eye className="h-4 w-4 text-accent" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium">{section.section_label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">/{section.section_key}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{section.visible ? 'Visible' : 'Hidden'}</span>
                    <Switch checked={section.visible} onCheckedChange={() => handleToggle(section)} />
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(section)} className="gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
