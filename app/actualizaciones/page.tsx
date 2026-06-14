import { getUpdates } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default async function ActualizacionesPage() {
  const updates = await getUpdates(50);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Actualizaciones</h1>
        <p className="text-muted-foreground mt-2">
          Seguimiento de cambios en reglas, condiciones y restricciones de las principales prop firms.
        </p>
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay actualizaciones disponibles.
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => {
            const cfg = typeConfig[update.type];
            const Icon = cfg.icon;
            return (
              <div
                key={update.id}
                className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-4 hover:border-border transition-colors"
              >
                <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-primary">
                      {update.prop_name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${cfg.bg} ${cfg.color}`}
                    >
                      {update.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(update.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm">{update.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{update.summary}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
