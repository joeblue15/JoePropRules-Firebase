'use client';

import { AlertTriangle, Info, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Rule, CategoryType } from '@/lib/types';

interface RuleSectionProps {
  rule: Rule | undefined;
  category: CategoryType;
}

const alertConfig = {
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
};

const fieldConfig: Record<CategoryType, { key: string; label: string }[]> = {
  riesgo: [
    { key: 'drawdown_maximo', label: 'Drawdown Máximo' },
    { key: 'drawdown_diario', label: 'Drawdown Diario' },
    { key: 'tipo_drawdown', label: 'Tipo de Drawdown' },
    { key: 'basado_en', label: 'Basado en' },
    { key: 'lotaje_maximo', label: 'Lotaje Máximo' },
    { key: 'hedging', label: 'Hedging' },
    { key: 'exposicion_maxima', label: 'Exposición Máxima' },
    { key: 'posiciones_simultaneas', label: 'Posiciones Simultáneas' },
    { key: 'martingale', label: 'Martingale' },
    { key: 'grid_trading', label: 'Grid Trading' },
  ],
  objetivos: [
    { key: 'profit_target_fase1', label: 'Profit Target Fase 1' },
    { key: 'profit_target_fase2', label: 'Profit Target Fase 2' },
    { key: 'consistencia', label: 'Consistencia' },
    { key: 'dias_minimos', label: 'Días Mínimos' },
    { key: 'tiempo_maximo', label: 'Tiempo Máximo' },
    { key: 'beneficio_minimo', label: 'Beneficio Mínimo' },
  ],
  trading: [
    { key: 'noticias', label: 'News Trading' },
    { key: 'overnight', label: 'Overnight' },
    { key: 'weekend_holding', label: 'Weekend Holding' },
    { key: 'copy_trading', label: 'Copy Trading' },
    { key: 'expert_advisors', label: 'Expert Advisors / EAs' },
    { key: 'scalping', label: 'Scalping' },
    { key: 'hft', label: 'HFT' },
    { key: 'latency_arbitrage', label: 'Latency Arbitrage' },
    { key: 'reverse_arbitrage', label: 'Reverse Arbitrage' },
    { key: 'one_sided_betting', label: 'One-Sided Betting' },
  ],
  financiada: [
    { key: 'profit_split', label: 'Profit Split' },
    { key: 'frecuencia_pagos', label: 'Frecuencia de Pagos' },
    { key: 'payout_minimo', label: 'Payout Mínimo' },
    { key: 'escalamiento', label: 'Escalamiento' },
    { key: 'tamano_maximo_cuenta', label: 'Tamaño Máximo de Cuenta' },
    { key: 'primer_retiro', label: 'Primer Retiro' },
  ],
  legal: [
    { key: 'vpn', label: 'VPN' },
    { key: 'vps', label: 'VPS' },
    { key: 'ip_compartida', label: 'IP Compartida' },
    { key: 'multiples_cuentas', label: 'Múltiples Cuentas' },
    { key: 'restricciones_pais', label: 'Restricciones por País' },
    { key: 'kyc', label: 'KYC' },
    { key: 'politica_abuso', label: 'Política de Abuso' },
  ],
  restricciones: [],
  letra_pequena: [],
};

function formatValue(value: unknown): { text: string; color: string } {
  if (typeof value === 'boolean') {
    return value
      ? { text: 'Permitido', color: 'text-green-500' }
      : { text: 'Prohibido', color: 'text-red-500' };
  }
  const text = String(value);
  if (/^(permitido|sí|yes|true|allowed|activo)$/i.test(text.trim()))
    return { text, color: 'text-green-500' };
  if (/^(prohibido|no|false|not allowed|no permitido)$/i.test(text.trim()))
    return { text, color: 'text-red-500' };
  return { text, color: 'text-foreground' };
}

export function RuleSection({ rule, category }: RuleSectionProps) {
  if (!rule || Object.keys(rule.content).length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No hay información disponible para esta sección.
      </div>
    );
  }

  const fields = fieldConfig[category];

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {rule.alerts && rule.alerts.length > 0 && (
        <div className="space-y-2">
          {rule.alerts.map((alert, i) => {
            const cfg = alertConfig[alert.type];
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${cfg.bg}`}>
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                <p className="text-sm text-foreground">{alert.message}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main rules table */}
        {fields.length > 0 && (
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-sm font-semibold">Reglas principales</h3>
            </div>
            <div className="divide-y divide-border/40">
              {fields.map(({ key, label }) => {
                const val = rule.content[key];
                if (val === undefined || val === null || val === '') return null;
                const { text, color } = formatValue(val);
                return (
                  <div key={key} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className={`text-sm font-medium ${color}`}>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sidebar: alerts summary + interpretations */}
        <div className="space-y-4">
          {rule.alerts && rule.alerts.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold">Alertas</h3>
              </div>
              <div className="divide-y divide-border/40">
                {rule.alerts.map((alert, i) => {
                  const cfg = alertConfig[alert.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="px-4 py-3 flex items-start gap-2.5">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                      <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rule.interpretations && rule.interpretations.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold">Casos reales</h3>
              </div>
              <div className="divide-y divide-border/40">
                {rule.interpretations.map((item, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="text-xs font-medium mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restricciones especiales */}
      {category === 'restricciones' && (() => {
        const restricciones = rule.content.restricciones;
        if (!Array.isArray(restricciones) || restricciones.length === 0) return null;
        return (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-sm font-semibold">Restricciones</h3>
            </div>
            <div className="divide-y divide-border/40">
              {restricciones.map((r: { titulo?: string; descripcion?: string }, i: number) => (
                <div key={i} className="px-4 py-3">
                  <p className="text-sm font-medium mb-1">{r.titulo}</p>
                  {r.descripcion && <p className="text-xs text-muted-foreground">{r.descripcion}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Letra pequeña */}
      {category === 'letra_pequena' && typeof rule.content.texto === 'string' && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: rule.content.texto }}
          />
        </div>
      )}

      {/* Importante notice */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Importante</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Estas reglas pueden cambiar. Consulta siempre las actualizaciones más recientes.
            </p>
          </div>
        </div>
        <Link
          href="/actualizaciones"
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap shrink-0"
        >
          Ver actualizaciones <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
