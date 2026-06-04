'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Check } from 'lucide-react';

export function ContactSection() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contact" className="py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">
            Get in Touch
          </h2>
          <p className="text-muted-foreground mt-3 font-light">
            Have a project in mind? Let&apos;s talk about it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="you@example.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="Project inquiry" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea placeholder="Tell me about your project..." rows={5} required />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={sent}>
            {sent ? (
              <>
                <Check className="h-4 w-4" />
                Message Sent
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
