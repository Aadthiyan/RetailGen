'use client';

import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';

export default function DemoPage() {
  return (
    <Container>
      <div className="py-20">
        <h1 className="text-4xl font-bold mb-4">RetailGen Demo</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to RetailGen AI - Your AI-powered campaign suite generator
        </p>
        <Button>Get Started</Button>
      </div>
    </Container>
  );
}