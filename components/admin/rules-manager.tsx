'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash, Save, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Prop, Challenge, Rule, CategoryType, Alert, Interpretation } from '@/lib/types';

// ── Field config per category ───────────────────────────────────────────────

const fieldConfig: Record<string, { key: string; label: string; hint?: string }[]> = {
  riesgo: [
    { key: 'drawdown_maximo',      label: 'Drawdown Máximo',        hint: 'Ej: 10%' },
    { key: 'drawdown_diario',      label: 'Drawdown Diario',        hint: 'Ej: 5%' },
    { key: 'tipo_drawdown',        label: 'Tipo de Drawdown',       hint: 'Ej: Balance, Equity' },
    { key: 'basado_en',            label: 'Basado en',              hint: 'Ej: Balance inicial' },
    { key: 'lotaje_maximo',        label: 'Lotaje Máximo',          hint: 'Ej: 100 lotes' },
    { key: 'hedging',              label: 'Hedging',                hint: 'Permitido / Prohibido' },
    { key: 'exposicion_maxima',    label: 'Exposición Máxima',      hint: 'Ej: 50%' },
    { key: 'posiciones_simultaneas', label: 'Posiciones Simultáneas', hint: 'Ej: Ilimitadas, 5' },
    { key: 'martingale',           label: 'Martingale',             hint: 'Permitido / Prohibido' },
    { key: 'grid_trading',         label: 'Grid Trading',           hint: 'Permitido / Prohibido' },
  ],
  objetivos: [
    { key: 'profit_target_fase1',  label: 'Profit Target Fase 1',   hint: 'Ej: 8%' },
    { key: 'profit_target_fase2',  label: 'Profit Target Fase 2',   hint: 'Ej: 5%' },
    { key: 'consistencia',         label: 'Consistencia',           hint: 'Ej: No más del 30% en un día' },
    { key: 'dias_minimos',         label: 'Días Mínimos',           hint: 'Ej: 4' },
    { key: 'tiempo_maximo',        label: 'Tiempo Máximo',          hint: 'Ej: 30 días' },
    { key: 'beneficio_minimo',     label: 'Beneficio Mínimo',       hint: 'Ej: 0.5%' },
  ],
  trading: [
    { key: 'noticias',             label: 'News Trading',           hint: 'Permitido / Prohibido / Restringido' },
    { key: 'overnight',            label: 'Overnight',              hint: 'Permitido / Prohibido' },
    { key: 'weekend_holding',      label: 'Weekend Holding',        hint: 'Permitido / Prohibido' },
    { key: 'copy_trading',         label: 'Copy Trading',           hint: 'Permitido / Prohibido' },
    { key: 'expert_advisors',      label: 'Expert Advisors (EAs)',  hint: 'Permitido / Prohibido' },
    { key: 'scalping',             label: 'Scalping',               hint: 'Permitido / Prohibido' },
    { key: 'hft',                  label: 'HFT',                    hint: 'Permitido / Prohibido' },
    { key: 'latency_arbitrage',    label: 'Latency Arbitrage',      hint: 'Permitido / Prohibido' },
    { key: 'reverse_arbitrage',    label: 'Reverse Arbitrage',      hint: 'Permitido / Prohibido' },
    { key: 'one_sided_betting',    label: 'One-Sided Betting',      hint: 'Permitido / Prohibido' },
  ],
  financiada: [
    { key: 'profit_split',         label: 'Profit Split',           hint: 'Ej: 80%' },
    { key: 'frecuencia_pagos',     label: 'Frecuencia de Pagos',    hint: 'Ej: Mensual, Semanal' },
    { key: 'payout_minimo',        label: 'Payout Mínimo',          hint: 'Ej: $100' },
    { key: 'escalamiento',         label: 'Escalamiento',           hint: 'Describe el plan' },
    { key: 'tamano_maximo_cuenta', label: 'Tamaño Máximo Cuenta',   hint: 'Ej: $400,000' },
    { key: 'primer_retiro',        label: 'Primer Retiro',          hint: 'Ej: Después de 14 días' },
  ],
  legal: [
    { key: 'vpn',                  label: 'VPN',                    hint: 'Permitido / Prohibido' },
    { key: 'vps',                  label: 'VPS',                    hint: 'Permitido / Prohibido' },
    { key: 'ip_compartida',        label: 'IP Compartida',          hint: 'Permitido / Prohibido' },
    { key: 'multiples_cuentas',    label: 'Múltiples Cuentas',      hint: 'Permitido / Prohibido' },
    { key: 'restricciones_pais',   label: 'Restricciones por País', hint: 'Ej: No disponible en EEUU' },
    { key: 'kyc',                  label: 'KYC',                    hint: 'Requerido / No requerido' },
    { key: 'politica_abuso',       label: 'Política de Abuso',      hint: 'Describe brevemente' },
  ],
};

const categoryTabs: { key: CategoryType; label: string }[] = [
  { key: 'riesgo',        label: 'Riesgo' },
  { key: 'objetivos',     label: 'Objetivos' },
  { key: 'trading',       label: 'Trading' },
  { key: 'restricciones', label: 'Restricciones' },
  { key: 'financiada',    label: 'Financiada' },
  { key: 'legal',         label: 'Legal' },
  { key: 'letra_pequena', label: 'Letra pequeña' },
];

// ── Alert editor ─────────────────────────────────────────────────────────────

function AlertsEditor({ alerts, onChange }: {
  alerts: Alert[];
  onChange: (alerts: Alert[]) => void;
}) {
  const add = () => onChange([...alerts, { type: 'warning', message: '' }]);
  const remove = (i: number) => onChange(alerts.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Alert, value: string) => {
    const copy = [...alerts];
    copy[i] = { ...copy[i], [field]: value } as Alert;
    onChange(copy);
  };

  const iconMap = { warning: AlertTriangle, info: Info, critical: AlertCircle };
  const colorMap = { warning: 'text-yellow-500', info: 'text-blue-400', critical: 'text-red-500' };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Alertas</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
        </Button>
      </div>
      {alerts.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Sin alertas</p>
      )}
      {alerts.map((alert, i) => {
        const Icon = iconMap[alert.type];
        return (
          <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-border/50 bg-secondary/20">
            <Select value={alert.type} onValueChange={(v) => update(i, 'type', v)}>
              <SelectTrigger className="w-28 h-8 text-xs shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Atención</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 flex items-start gap-2">
              <Icon className={`h-4 w-4 mt-1.5 shrink-0 ${colorMap[alert.type]}`} />
              <Input
                className="text-sm h-8"
                value={alert.message}
                onChange={(e) => update(i, 'message', e.target.value)}
                placeholder="Mensaje de la alerta..."
              />
            </div>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => remove(i)}>
              <Trash className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// ── Interpretations editor ───────────────────────────────────────────────────

function InterpretationsEditor({ items, onChange }: {
  items: Interpretation[];
  onChange: (items: Interpretation[]) => void;
}) {
  const add = () => onChange([...items, { title: '', content: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Interpretation, value: string) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Casos reales</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Sin casos reales</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg border border-border/50 bg-secondary/20 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              className="text-sm h-8 font-medium"
              value={item.title}
              onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Título del caso..."
            />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => remove(i)}>
              <Trash className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
          <Textarea
            className="text-sm min-h-[60px] resize-none"
            value={item.content}
            onChange={(e) => update(i, 'content', e.target.value)}
            placeholder="Descripción del caso real..."
          />
        </div>
      ))}
    </div>
  );
}

// ── Restricciones editor (special case) ──────────────────────────────────────

function RestriccionesEditor({ items, onChange }: {
  items: { titulo: string; descripcion: string }[];
  onChange: (items: { titulo: string; descripcion: string }[]) => void;
}) {
  const add = () => onChange([...items, { titulo: '', descripcion: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Lista de restricciones</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
        </Button>
      </div>
      {items.length === 0 && <p className="text-xs text-muted-foreground italic">Sin restricciones</p>}
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg border border-border/50 bg-secondary/20 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              className="text-sm h-8 font-medium"
              value={item.titulo}
              onChange={(e) => update(i, 'titulo', e.target.value)}
              placeholder="Título de la restricción..."
            />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => remove(i)}>
              <Trash className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
          <Textarea
            className="text-sm min-h-[56px] resize-none"
            value={item.descripcion}
            onChange={(e) => update(i, 'descripcion', e.target.value)}
            placeholder="Descripción detallada..."
          />
        </div>
      ))}
    </div>
  );
}

// ── Category rule editor ──────────────────────────────────────────────────────

function CategoryEditor({
  challengeId,
  category,
  existing,
  onSaved,
}: {
  challengeId: string;
  category: CategoryType;
  existing: Rule | undefined;
  onSaved: (rule: Rule) => void;
}) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [interpretations, setInterpretations] = useState<Interpretation[]>([]);
  const [restricciones, setRestricciones] = useState<{ titulo: string; descripcion: string }[]>([]);
  const [letraText, setLetraText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      const c = existing.content as Record<string, unknown>;
      const flat: Record<string, string> = {};
      (fieldConfig[category] || []).forEach(({ key }) => {
        if (c[key] !== undefined && c[key] !== null) flat[key] = String(c[key]);
      });
      setContent(flat);
      setAlerts(existing.alerts || []);
      setInterpretations(existing.interpretations || []);
      if (category === 'restricciones') {
        setRestricciones((c.restricciones as { titulo: string; descripcion: string }[]) || []);
      }
      if (category === 'letra_pequena') {
        setLetraText(typeof c.texto === 'string' ? c.texto : '');
      }
    } else {
      setContent({});
      setAlerts([]);
      setInterpretations([]);
      setRestricciones([]);
      setLetraText('');
    }
  }, [existing, category]);

  const buildContent = () => {
    if (category === 'restricciones') return { restricciones };
    if (category === 'letra_pequena') return { texto: letraText };
    const filtered: Record<string, string> = {};
    Object.entries(content).forEach(([k, v]) => { if (v.trim()) filtered[k] = v.trim(); });
    return filtered;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement Firestore upsert
      toast.success('Reglas guardadas');
      onSaved(null);
    } catch (e: unknown) {
      toast.error('Error al guardar: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const fields = fieldConfig[category] || [];

  return (
    <div className="space-y-6 py-4">
      {/* Standard fields */}
      {fields.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Campos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(({ key, label, hint }) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key} className="text-xs text-muted-foreground">{label}</Label>
                <Input
                  id={key}
                  className="h-8 text-sm"
                  placeholder={hint}
                  value={content[key] || ''}
                  onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restricciones special */}
      {category === 'restricciones' && (
        <RestriccionesEditor items={restricciones} onChange={setRestricciones} />
      )}

      {/* Letra pequeña special */}
      {category === 'letra_pequena' && (
        <div className="space-y-1">
          <Label className="text-sm font-semibold">Texto (HTML permitido)</Label>
          <Textarea
            className="min-h-[160px] text-sm font-mono"
            value={letraText}
            onChange={(e) => setLetraText(e.target.value)}
            placeholder="<p>Texto de la letra pequeña...</p>"
          />
        </div>
      )}

      {/* Alerts */}
      <AlertsEditor alerts={alerts} onChange={setAlerts} />

      {/* Interpretations */}
      {category !== 'restricciones' && category !== 'letra_pequena' && (
        <InterpretationsEditor items={interpretations} onChange={setInterpretations} />
      )}

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar esta sección'}
      </Button>
    </div>
  );
}

// ── Score editor ──────────────────────────────────────────────────────────────

function ScoreEditor({ challengeId, existing, onSaved }: {
  challengeId: string;
  existing: Record<string, number> | null;
  onSaved: () => void;
}) {
  const [scores, setScores] = useState({
    overall_score: 0, riesgo_score: 0, objetivos_score: 0,
    trading_score: 0, financiada_score: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) setScores({ ...scores, ...existing });
    else setScores({ overall_score: 0, riesgo_score: 0, objetivos_score: 0, trading_score: 0, financiada_score: 0 });
  }, [existing]);

  const fields = [
    { key: 'overall_score',    label: 'Score general (0-100)' },
    { key: 'riesgo_score',     label: 'Riesgo' },
    { key: 'objetivos_score',  label: 'Objetivos' },
    { key: 'trading_score',    label: 'Trading' },
    { key: 'financiada_score', label: 'Financiada' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement Firestore upsert
      toast.success('Score guardado');
      onSaved();
    } catch (e: unknown) {
      toast.error('Error al guardar: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground">Valores de 0 a 100. El score general se muestra en la página del challenge.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              className="h-8 text-sm"
              value={(scores as Record<string, number>)[key] ?? 0}
              onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar scores'}
      </Button>
    </div>
  );
}

// ── Challenge rules view ───────────────────────────────────────────────────────

function ChallengeRulesEditor({ challengeId, challengeName }: { challengeId: string; challengeName: string }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [score, setScore] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implement Firestore queries
      setRules([]);
      setScore(null);
    } catch {
      toast.error('Error al cargar reglas');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="space-y-3 pt-4">{[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>;
  }

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">{challengeName}</h3>
        <Badge variant="secondary">{rules.length} categorías con datos</Badge>
      </div>

      <Tabs defaultValue="riesgo">
        <div className="overflow-x-auto scrollbar-none border-b border-border/50 -mx-0 mb-1">
          <TabsList className="h-auto p-0 bg-transparent rounded-none gap-0 min-w-max">
            <TabsTrigger value="score" className="px-3 py-2.5 rounded-none text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent bg-transparent text-muted-foreground">
              Score
            </TabsTrigger>
            {categoryTabs.map(({ key, label }) => {
              const hasData = rules.some((r) => r.category === key);
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="relative px-3 py-2.5 rounded-none text-sm border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent bg-transparent text-muted-foreground whitespace-nowrap"
                >
                  {label}
                  {hasData && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="score" className="mt-0">
          <ScoreEditor
            challengeId={challengeId}
            existing={score}
            onSaved={load}
          />
        </TabsContent>

        {categoryTabs.map(({ key }) => (
          <TabsContent key={key} value={key} className="mt-0">
            <CategoryEditor
              challengeId={challengeId}
              category={key}
              existing={rules.find((r) => r.category === key)}
              onSaved={(rule) => {
                setRules((prev) => {
                  const idx = prev.findIndex((r) => r.category === key);
                  if (idx >= 0) { const n = [...prev]; n[idx] = rule; return n; }
                  return [...prev, rule];
                });
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ── Main RulesManager ──────────────────────────────────────────────────────────

export function RulesManager() {
  const [props, setProps] = useState<Prop[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedPropId, setSelectedPropId] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // TODO: Implement Firestore query
      setProps([]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedPropId) { setChallenges([]); setSelectedChallengeId(''); return; }
    (async () => {
      // TODO: Implement Firestore query
      setChallenges([]);
      setSelectedChallengeId('');
    })();
  }, [selectedPropId]);

  if (loading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>;

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId);

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border/50 bg-secondary/20">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">1. Prop firm</Label>
          <Select value={selectedPropId} onValueChange={setSelectedPropId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prop firm..." />
            </SelectTrigger>
            <SelectContent>
              {props.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">2. Challenge</Label>
          <Select value={selectedChallengeId} onValueChange={setSelectedChallengeId} disabled={!selectedPropId}>
            <SelectTrigger>
              <SelectValue placeholder={selectedPropId ? 'Seleccionar challenge...' : 'Primero elige una prop'} />
            </SelectTrigger>
            <SelectContent>
              {challenges.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rules editor */}
      {selectedChallengeId && selectedChallenge ? (
        <ChallengeRulesEditor
          key={selectedChallengeId}
          challengeId={selectedChallengeId}
          challengeName={selectedChallenge.name}
        />
      ) : (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
          Selecciona una prop firm y un challenge para editar sus reglas
        </div>
      )}
    </div>
  );
}
