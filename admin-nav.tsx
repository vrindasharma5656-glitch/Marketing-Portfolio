'use client';

import { useAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { LogOut, FolderOpen, User, Layout, Tags } from 'lucide-react';

type Tab = 'projects' | 'about' | 'sections' | 'categories';

interface AdminNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const { logout } = useAuth();

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'projects', label: 'Projects', icon: <FolderOpen className="h-4 w-4" /> },
    { key: 'about', label: 'About Me', icon: <User className="h-4 w-4" /> },
    { key: 'sections', label: 'Sections', icon: <Layout className="h-4 w-4" /> },
    { key: 'categories', label: 'Tags', icon: <Tags className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-light tracking-tight mr-6">Dashboard</h1>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onTabChange(tab.key)}
              className="gap-2"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
