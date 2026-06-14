'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Update } from '@/lib/types';

interface HomeUpdatesProps {
  updates: (Update & { prop_name: string; prop_logo_url: string | null; prop_slug: string })[];
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  reglas:        { label: 'REGLAS',        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  restricciones: { label: 'RESTRICCIONES', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  payout:        { label: 'PAYOUT',        className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  trading:       { label: 'TRADING',       className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  kyc:           { label: 'KYC',           className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  general:       { label: 'GENERAL',       className: 'bg-secondary text-muted-foreground border-border' },
};

const typeToCategory: Record<string, string> = {
  info:     'reglas',
  warning:  'restricciones',
  critical: 'payout',
};

export function HomeUpdates({ updates }: HomeUpdatesProps) {
  if (updates.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No hay actualizaciones recientes.</p>;
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/40">
      {updates.map((update) => {
        const categoryKey = update.category || typeToCategory[update.type] || 'general';
        const badge = categoryConfig[categoryKey] || categoryConfig.general;
        const timeAgo = formatDistanceToNow(new Date(update.created_at), { addSuffix: true, locale: es });

        return (
          <Link
            key={update.id}
            href={`/${update.prop_slug}`}
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/30 transition-colors group"
          >
            {/* Prop logo */}
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border/40">
              {update.prop_logo_url ? (
                <img src={update.prop_logo_url} alt={update.prop_name} className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{update.prop_name.charAt(0)}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-sm font-semibold text-foreground truncate">{update.prop_name}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate leading-snug group-hover:text-foreground transition-colors">
                {update.title}
              </p>
            </div>

            {/* Right: badge + time */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${badge.className}`}>
                {badge.label}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">{timeAgo}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
