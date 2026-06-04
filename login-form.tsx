'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(password);
    if (!success) {
      setError('Invalid password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-light tracking-tight">Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              autoFocus
            />
            {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={loading || !password}>
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
