import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Update } from '@/lib/types';

const typeBadge: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface RelatedUpdatesProps {
  updates: Update[];
}

export function RelatedUpdates({ updates }: RelatedUpdatesProps) {
  if (updates.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Actualizaciones relacionadas</h3>
        <Link
          href="/actualizaciones"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Ver todas las actualizaciones <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-2">
        {updates.map((update) => (
          <div
            key={update.id}
            className="flex items-start gap-4 rounded-lg border border-border/50 bg-card px-4 py-3"
          >
            <div className="shrink-0 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(update.created_at), { addSuffix: true, locale: es })}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${typeBadge[update.type]}`}
                >
                  {update.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium">{update.title}</p>
              {update.summary && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{update.summary}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
