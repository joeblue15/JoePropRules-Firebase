'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ChallengeWithDetails, CategoryType } from '@/lib/types';
import { RuleSection } from './rule-section';
import { ResumenSection } from './resumen-section';

interface RulesTabsProps {
  challenge: ChallengeWithDetails;
  categories: CategoryType[];
}

const tabConfig: { key: CategoryType | 'resumen'; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'riesgo', label: 'Riesgo' },
  { key: 'objetivos', label: 'Objetivos' },
  { key: 'trading', label: 'Reglas de Trading' },
  { key: 'restricciones', label: 'Restricciones Especiales' },
  { key: 'financiada', label: 'Financiada' },
  { key: 'legal', label: 'Legal' },
  { key: 'letra_pequena', label: 'La letra pequeña' },
];

export function RulesTabs({ challenge, categories }: RulesTabsProps) {
  const rules = challenge.rules || [];

  return (
    <Tabs defaultValue="resumen" className="w-full">
      <div className="sticky top-16 z-10 bg-background border-b border-border/50 -mx-4 px-4">
        <div className="overflow-x-auto scrollbar-none">
          <TabsList className="h-auto p-0 bg-transparent justify-start rounded-none gap-0 min-w-max">
            {tabConfig.map(({ key, label }) => {
              const rule = key !== 'resumen' ? rules.find((r) => r.category === key) : null;
              const alertCount = rule?.alerts?.length || 0;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="relative px-4 py-3 rounded-none text-sm font-medium text-muted-foreground border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent hover:text-foreground hover:bg-transparent transition-colors bg-transparent whitespace-nowrap"
                >
                  {label}
                  {alertCount > 0 && (
                    <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 text-[9px] font-bold">
                      {alertCount}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>

      <div className="py-6">
        <TabsContent value="resumen" className="mt-0">
          <ResumenSection challenge={challenge} />
        </TabsContent>

        {categories.map((category) => {
          const rule = rules.find((r) => r.category === category);
          return (
            <TabsContent key={category} value={category} className="mt-0">
              <RuleSection rule={rule} category={category} />
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
}
