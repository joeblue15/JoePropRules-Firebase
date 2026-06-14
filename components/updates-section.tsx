'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { Update } from '@/lib/types';

interface UpdatesSectionProps {
  updates: (Update & { prop_name: string })[];
}

const typeConfig = {
  info: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
};

export function UpdatesSection({ updates }: UpdatesSectionProps) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay actualizaciones recientes
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {updates.map((update) => {
        const config = typeConfig[update.type];
        const Icon = config.icon;

        return (
          <div
            key={update.id}
            className="rounded-lg border border-border/60 bg-card/50 p-4 transition-all hover:border-border hover:bg-card/80"
          >
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2 ${config.bgColor}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-primary">
                    {update.prop_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(update.created_at), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
                <h4 className="font-medium mt-1">{update.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {update.summary}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
