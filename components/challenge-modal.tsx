'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PropWithDetails } from '@/lib/types';
import { getPropBySlug } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChallengeModalProps {
  propSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TagPill({ tag, index }: { tag: string; index: number }) {
  const colors = [
    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'bg-secondary text-muted-foreground border-border/60',
    'bg-green-500/10 text-green-500 border-green-500/20',
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colors[index % colors.length]}`}>
      {tag}
    </span>
  );
}

export function ChallengeModal({ propSlug, open, onOpenChange }: ChallengeModalProps) {
  const [prop, setProp] = useState<PropWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getPropBySlug(propSlug).then((data) => {
      setProp(data);
      setLoading(false);
      if (data?.challenges?.length === 1) {
        onOpenChange(false);
        router.push(`/${propSlug}/${data.challenges[0].slug}`);
      }
    });
  }, [propSlug, open]);

  const handleSelect = (challengeSlug: string) => {
    onOpenChange(false);
    router.push(`/${propSlug}/${challengeSlug}`);
  };

  const ChallengeList = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[80px] rounded-xl" />)}
        </div>
      );
    }

    if (!prop || !prop.challenges || prop.challenges.length === 0) {
      return (
        <p className="text-center text-sm text-muted-foreground py-8">No hay challenges disponibles.</p>
      );
    }

    return (
      <div className="space-y-2">
        {prop.challenges.map((challenge, idx) => (
          <button
            key={challenge.id}
            onClick={() => handleSelect(challenge.slug)}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              {prop.logo_url ? (
                <img src={prop.logo_url} alt={prop.name} className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{challenge.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-1.5">{challenge.name}</div>
              {challenge.tags && challenge.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {challenge.tags.map((tag, i) => <TagPill key={tag} tag={tag} index={i} />)}
                </div>
              )}
              {challenge.description && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{challenge.description}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </button>
        ))}

        <div className="pt-2 border-t border-border/40">
          <a
            href={prop.website_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            onClick={(e) => { if (!prop.website_url) e.preventDefault(); }}
          >
            ¿No sabes cuál elegir? Ver comparativa
            <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  };

  const PropInfo = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    if (!prop) return null;

    return (
      <div className="flex flex-col gap-4">
        {/* Logo */}
        <div className="h-28 rounded-xl border border-border/50 bg-card flex items-center justify-center p-4 overflow-hidden">
          {prop.logo_url ? (
            <img src={prop.logo_url} alt={prop.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-4xl font-extrabold text-muted-foreground">{prop.name.charAt(0)}</span>
          )}
        </div>

        {/* Name + description */}
        <div>
          <h3 className="font-bold text-lg">{prop.name}</h3>
          {prop.challenges && prop.challenges.length > 0 && prop.challenges[0].description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-4">
              {prop.challenges[0].description}
            </p>
          )}
        </div>

        {/* Official site */}
        {prop.website_url && (
          <a
            href={prop.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Sitio oficial <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {/* Challenge count */}
        <div className="mt-auto pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            {prop.challenges?.length || 0} challenge{prop.challenges?.length !== 1 ? 's' : ''} disponible{prop.challenges?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-8">
          <SheetHeader className="pb-4">
            <SheetTitle>Selecciona un challenge</SheetTitle>
            {!loading && prop && (
              <div className="flex items-center gap-3">
                {prop.logo_url && (
                  <div className="h-10 w-10 rounded-lg border border-border/60 bg-card flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                    <img src={prop.logo_url} alt={prop.name} className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{prop.name}</p>
                  {prop.website_url && (
                    <a href={prop.website_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      Sitio oficial <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </SheetHeader>
          <ChallengeList />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-[220px_1fr]">
          {/* Left panel */}
          <div className="bg-secondary/30 border-r border-border/50 p-5">
            <PropInfo />
          </div>

          {/* Right panel */}
          <div className="p-5 overflow-y-auto max-h-[80vh]">
            <DialogHeader className="pb-4">
              <DialogTitle>Selecciona un challenge</DialogTitle>
            </DialogHeader>
            <ChallengeList />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
