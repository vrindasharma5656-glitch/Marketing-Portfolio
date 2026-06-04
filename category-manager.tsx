'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/admin-auth';
import { getCategories, createCategory, deleteCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export function CategoryManager() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getCategories(token);
      setCategories(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error loading categories', description: msg, variant: 'destructive' });
    }
    setLoading(false);
  }, [token, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!token || !newName.trim()) return;
    setAdding(true);
    try {
      const cat = await createCategory(token, newName.trim());
      setCategories((prev) => [...prev, cat]);
      setNewName('');
      toast({ title: 'Tag added' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed';
      toast({ title: 'Failed to add tag', description: msg, variant: 'destructive' });
    }
    setAdding(false);
  };

  const handleDelete = async (cat: Category) => {
    if (!token || !confirm(`Delete tag "${cat.name}"?`)) return;
    try {
      await deleteCategory(token, cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast({ title: 'Tag deleted' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light tracking-tight">Category Tags</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage filter tags for your work</p>
      </div>
      <div className="flex gap-3">
        <Input placeholder="New tag name (e.g., Brand Analysis)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} className="max-w-sm" />
        <Button onClick={handleAdd} disabled={adding || !newName.trim()} className="gap-2 shrink-0">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Tag
        </Button>
      </div>
      <Separator />
      {categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No tags yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="animate-fade-in">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <Badge variant="secondary" className="text-sm py-1 px-3">{cat.name}</Badge>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(cat)} className="gap-1 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
