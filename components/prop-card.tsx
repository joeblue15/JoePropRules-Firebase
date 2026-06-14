'use client';

import { useState } from 'react';
import type { Prop } from '@/lib/types';
import { ChallengeModal } from './challenge-modal';

interface PropCardProps {
  prop: Prop;
}

export function PropCard({ prop }: PropCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className="group relative rounded-xl border border-border/50 bg-card hover:border-border transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30"
        onClick={() => setModalOpen(true)}
      >
        <div className="aspect-[4/3] flex items-center justify-center p-6 bg-card">
          {prop.logo_url ? (
            <img
              src={prop.logo_url}
              alt={prop.name}
              className="max-h-full max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="text-3xl font-bold text-muted-foreground group-hover:text-foreground transition-colors">
              {prop.name.split(' ').slice(0, 2).map(w => w.charAt(0)).join('')}
            </div>
          )}
        </div>
        <div className="border-t border-border/50 px-3 py-2.5">
          <button className="w-full text-center text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
            Ver reglas
            <svg className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <ChallengeModal propSlug={prop.slug} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
