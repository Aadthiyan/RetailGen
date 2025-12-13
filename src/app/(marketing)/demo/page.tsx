'use client';

import { Button } from '@/components/ui/button';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-4 text-white">RetailGen Demo</h1>
        <p className="text-lg text-gray-300 mb-8">
          Welcome to RetailGen AI - Your AI-powered campaign suite generator
        </p>
        <Button>Get Started</Button>
      </div>
    </div>
  );
}