'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ChallengeWithDetails, CategoryType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ResumenSectionProps {
  challenge: ChallengeWithDetails;
}

const categoryConfig: {
  key: CategoryType;
  label: string;
  icon: string;
  fields: { key: string; label: string }[];
}[] = [
  {
    key: 'riesgo',
    label: 'Riesgo',
    icon: '⚠️',
    fields: [
      { key: 'drawdown_maximo', label: 'Pérdida máxima total' },
      { key: 'drawdown_diario', label: 'Pérdida diaria máxima' },
      { key: 'tipo_drawdown', label: 'Tipo de drawdown' },
      { key: 'basado_en', label: 'Cálculo del drawdown' },
      { key: 'lotaje_maximo', label: 'Tamaño máximo de lote' },
      { key: 'hedging', label: 'Hedging' },
      { key: 'posiciones_simultaneas', label: 'Posiciones simultáneas máx.' },
      { key: 'exposicion_maxima', label: 'Exposición máxima por trade' },
    ],
  },
  {
    key: 'objetivos',
    label: 'Objetivos',
    icon: '🎯',
    fields: [
      { key: 'profit_target_fase1', label: 'Objetivo Fase 1' },
      { key: 'profit_target_fase2', label: 'Objetivo Fase 2' },
      { key: 'consistencia', label: 'Regla de consistencia' },
      { key: 'dias_minimos', label: 'Días mínimos de trading' },
      { key: 'tiempo_maximo', label: 'Días máximos para completar' },
      { key: 'beneficio_minimo', label: 'Beneficio mínimo' },
    ],
  },
  {
    key: 'trading',
    label: 'Reglas de Trading',
    icon: '📊',
    fields: [
      { key: 'noticias', label: 'Trading de noticias' },
      { key: 'overnight', label: 'Mantener posiciones overnight' },
      { key: 'weekend_holding', label: 'Mantener posiciones fin de semana' },
      { key: 'scalping', label: 'Scalping' },
      { key: 'expert_advisors', label: 'EAs' },
      { key: 'copy_trading', label: 'Copy trading' },
    ],
  },
  {
    key: 'financiada',
    label: 'Financiada',
    icon: '💰',
    fields: [
      { key: 'profit_split', label: 'Profit split' },
      { key: 'frecuencia_pagos', label: 'Frecuencia de pagos' },
      { key: 'payout_minimo', label: 'Payout mínimo' },
      { key: 'escalamiento', label: 'Plan de escalamiento' },
      { key: 'tamano_maximo_cuenta', label: 'Tamaño máximo de cuenta' },
      { key: 'primer_retiro', label: 'Primer retiro' },
    ],
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: '⚖️',
    fields: [
      { key: 'vpn', label: 'Uso de VPN' },
      { key: 'vps', label: 'IP dedicada / VPS' },
      { key: 'multiples_cuentas', label: 'Múltiples cuentas' },
      { key: 'restricciones_pais', label: 'Restricciones por país' },
      { key: 'kyc', label: 'KYC' },
      { key: 'politica_abuso', label: 'Definición de abuso' },
    ],
  },
];

function formatValue(value: unknown): { text: string; positive: boolean | null } {
  if (typeof value === 'boolean') {
    return { text: value ? 'Permitido' : 'No permitido', positive: value };
  }
  const text = String(value);
  if (/permitido|sí|yes|allowed/i.test(text)) return { text, positive: true };
  if (/prohibido|no permitido|not allowed/i.test(text)) return { text, positive: false };
  return { text, positive: null };
}

export function ResumenSection({ challenge }: ResumenSectionProps) {
  const rules = challenge.rules || [];
  const score = challenge.score;

  const tradingRule = rules.find((r) => r.category === 'trading');
  const riskRule = rules.find((r) => r.category === 'riesgo');

  const permitidos: string[] = [];
  const noPermitidos: string[] = [];
  const atenciones: string[] = [];

  const tradingFields = [
    { key: 'noticias', label: 'Trading de noticias' },
    { key: 'overnight', label: 'Mantener posiciones overnight' },
    { key: 'weekend_holding', label: 'Mantener posiciones fin de semana' },
    { key: 'scalping', label: 'Scalping' },
    { key: 'expert_advisors', label: 'EAs permitidos' },
    { key: 'copy_trading', label: 'Copy trading' },
    { key: 'hedging', label: 'Hedging' },
    { key: 'hft', label: 'HFT' },
    { key: 'latency_arbitrage', label: 'Arbitraje de latencia' },
    { key: 'reverse_arbitrage', label: 'Arbitraje inverso' },
  ];

  if (tradingRule?.content) {
    tradingFields.forEach(({ key, label }) => {
      const val = tradingRule.content[key];
      if (val === undefined || val === null) return;
      const { positive } = formatValue(val);
      if (positive === true) permitidos.push(label);
      else if (positive === false) noPermitidos.push(label);
    });
  }

  if (riskRule?.content) {
    if (riskRule.content.hedging !== undefined) {
      const { positive } = formatValue(riskRule.content.hedging);
      if (positive === true) permitidos.push('Hedging');
      else if (positive === false) noPermitidos.push('Hedging');
    }
    if (riskRule.content.martingale !== undefined) {
      const { positive } = formatValue(riskRule.content.martingale);
      if (positive === true) permitidos.push('Martingale');
      else if (positive === false) noPermitidos.push('Martingale');
    }
    if (riskRule.content.grid_trading !== undefined) {
      const { positive } = formatValue(riskRule.content.grid_trading);
      if (positive === true) permitidos.push('Grid Trading');
      else if (positive === false) noPermitidos.push('Grid Trading');
    }
  }

  rules.forEach((rule) => {
    (rule.alerts || []).forEach((alert) => {
      if (alert.type === 'warning' || alert.type === 'critical') {
        atenciones.push(alert.message);
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Quick summary banner */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="font-semibold text-base">Resumen rápido</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          {/* Permitido */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm font-semibold text-green-500">Permitido</span>
            </div>
            {permitidos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin datos</p>
            ) : (
              <ul className="space-y-1.5">
                {permitidos.slice(0, 6).map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-sm text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* No permitido */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-sm font-semibold text-red-500">No permitido</span>
            </div>
            {noPermitidos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin datos</p>
            ) : (
              <ul className="space-y-1.5">
                {noPermitidos.slice(0, 6).map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-sm text-foreground">
                    <XCircle className="h-3.5 w-3.5 mt-0.5 text-red-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Atención */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
              <span className="text-sm font-semibold text-yellow-500">Atención</span>
            </div>
            {atenciones.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin alertas</p>
            ) : (
              <ul className="space-y-1.5">
                {atenciones.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Rule category cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryConfig.map(({ key, label, icon, fields }) => {
          const rule = rules.find((r) => r.category === key);
          const hasData = rule && Object.keys(rule.content).length > 0;
          const filledFields = fields.filter((f) => {
            const val = rule?.content[f.key];
            return val !== undefined && val !== null && val !== '';
          });

          return (
            <div
              key={key}
              className="rounded-xl border border-border/50 bg-card overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                {score && key === 'riesgo' && (
                  <Badge variant="secondary" className="text-xs">
                    {score.riesgo_score}%
                  </Badge>
                )}
              </div>
              <div className="divide-y divide-border/40">
                {!hasData || filledFields.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-4 py-3">Sin datos disponibles</p>
                ) : (
                  filledFields.slice(0, 6).map(({ key: fKey, label: fLabel }) => {
                    const val = rule!.content[fKey];
                    const { text, positive } = formatValue(val);
                    return (
                      <div key={fKey} className="flex items-center justify-between px-4 py-2 text-sm">
                        <span className="text-muted-foreground truncate pr-2">{fLabel}</span>
                        <span
                          className={`font-medium shrink-0 ${
                            positive === true ? 'text-green-500' :
                            positive === false ? 'text-red-500' :
                            'text-foreground'
                          }`}
                        >
                          {text}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Notes adicionales / letra pequeña */}
        {(() => {
          const notaRule = rules.find((r) => r.category === 'letra_pequena');
          if (!notaRule || !notaRule.content.texto) return null;
          return (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                <span className="text-base">📝</span>
                <span className="text-sm font-semibold">Notas adicionales</span>
              </div>
              <div className="px-4 py-3">
                <div
                  className="text-sm text-muted-foreground leading-relaxed line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: typeof notaRule.content.texto === 'string' ? notaRule.content.texto : '' }}
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
