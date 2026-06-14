'use client';

import { Copy, ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChallengeWithDetails } from '@/lib/types';
import { toast } from 'sonner';

interface PropHeaderProps {
  challenge: ChallengeWithDetails;
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 8 ? 'text-green-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400';
  const ring  = score >= 8 ? 'stroke-green-400' : score >= 6 ? 'stroke-yellow-400' : 'stroke-red-400';
  const label = score >= 8 ? 'Bueno' : score >= 6 ? 'Regular' : 'Bajo';
  const r = 36;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Score</p>
      <div className="relative inline-flex">
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={ring}
            style={{
              strokeDasharray: c,
              strokeDashoffset: c - ((score / 10) * c),
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-extrabold ${color}`}>{score.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export function PropHeader({ challenge }: PropHeaderProps) {
  const prop = challenge.prop;
  const score = challenge.score;
  const discount = challenge.discount;
  const router = useRouter();

  const handleCopyCode = () => {
    if (discount?.code) {
      navigator.clipboard.writeText(discount.code);
      toast.success('Código copiado');
    }
  };

  const isActive = challenge.is_active;

  return (
    <div className="border-b border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        {/* Main info row */}
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="h-[72px] w-[120px] shrink-0 rounded-xl border border-border/60 bg-card flex items-center justify-center p-3 overflow-hidden">
            {prop?.logo_url ? (
              <img src={prop.logo_url} alt={prop.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-2xl font-extrabold text-muted-foreground">{prop?.name?.charAt(0)}</span>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-2">{challenge.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {prop?.type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border border-border/60 text-xs font-medium text-muted-foreground">
                  {prop.type === 'futures' ? 'Futuros' : 'CFD'}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium ${
                isActive
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : 'bg-secondary text-muted-foreground border border-border/60'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
              {prop?.website_url && (
                <a
                  href={prop.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Sitio oficial <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {challenge.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-lg line-clamp-2">
                {challenge.description}
              </p>
            )}
          </div>

          {/* Score */}
          {score && (
            <ScoreCircle score={score.overall_score / 10} />
          )}
        </div>

        {/* Discount banner */}
        {discount && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-400 text-base shrink-0">★</span>
              <span className="text-sm font-semibold text-amber-300">
                {discount.discount_percentage}% DESCUENTO
              </span>
              <span className="text-sm text-muted-foreground hidden sm:block">con código</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-sm font-mono font-bold text-foreground hover:text-primary transition-colors"
              >
                {discount.code}
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            {discount.affiliate_url && (
              <a
                href={discount.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0"
              >
                Ir al sitio oficial <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
