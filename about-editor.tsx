'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/admin-auth';
import { getAbout, updateAbout, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AboutData {
  id: string;
  headline: string;
  biography: string;
  photo_url: string | null;
}

export function AboutEditor() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [headline, setHeadline] = useState('');
  const [biography, setBiography] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getAbout(token);
      if (data) {
        setHeadline(data.headline);
        setBiography(data.biography);
        setPhotoUrl(data.photo_url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Error loading about data', description: msg, variant: 'destructive' });
    }
    setLoading(false);
  }, [token, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'profile');
      setPhotoUrl(url);
      toast({ title: 'Photo uploaded' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updateAbout(token, { headline: headline.trim(), biography: biography.trim(), photo_url: photoUrl || undefined });
      toast({ title: 'About section updated' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Update failed', description: msg, variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light tracking-tight">About Me</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Update your profile information</p>
      </div>
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-light">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Headline</label>
            <Input placeholder="Your professional headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Biography</label>
            <Textarea placeholder="Tell your story..." value={biography} onChange={(e) => setBiography(e.target.value)} rows={6} />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Profile Photo</label>
            {photoUrl ? (
              <div className="flex items-center gap-4">
                <img src={photoUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2" />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('photo-upload')?.click()}>Replace Photo</Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload profile photo</p>
              </div>
            )}
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
