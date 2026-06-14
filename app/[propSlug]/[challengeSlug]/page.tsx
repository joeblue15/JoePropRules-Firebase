import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { CategoryType, ChallengeWithDetails, Update } from '@/lib/types';
import { PropHeader } from '@/components/prop-header';
import { RulesTabs } from '@/components/rules-tabs';
import { RelatedUpdates } from '@/components/related-updates';

interface PageProps {
  params: Promise<{
    propSlug: string;
    challengeSlug: string;
  }>;
}

const categories: CategoryType[] = [
  'riesgo',
  'objetivos',
  'trading',
  'restricciones',
  'financiada',
  'legal',
  'letra_pequena',
];

async function getChallengeBySlug(propSlug: string, challengeSlug: string): Promise<ChallengeWithDetails | null> {
  const { data: prop } = await supabase
    .from('props')
    .select('*')
    .eq('slug', propSlug)
    .eq('is_active', true)
    .single();

  if (!prop) return null;

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('prop_id', prop.id)
    .eq('slug', challengeSlug)
    .eq('is_active', true);

  if (!challenges || challenges.length === 0) return null;
  const challenge = challenges[0];

  const [rulesRes, scoreRes, discountsRes] = await Promise.all([
    supabase.from('rules').select('*').eq('challenge_id', challenge.id),
    supabase.from('challenge_scores').select('*').eq('challenge_id', challenge.id).single(),
    supabase.from('discounts').select('*').eq('prop_id', prop.id).eq('is_active', true),
  ]);

  return {
    ...challenge,
    prop,
    rules: rulesRes.data || [],
    score: scoreRes.data || undefined,
    discount: discountsRes.data?.[0] || undefined,
  };
}

async function getRelatedUpdates(propId: string) {
  const { data } = await supabase
    .from('updates')
    .select('*')
    .eq('prop_id', propId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

export default async function ChallengePage({ params }: PageProps) {
  const { propSlug, challengeSlug } = await params;
  const challenge = await getChallengeBySlug(propSlug, challengeSlug);

  if (!challenge) {
    notFound();
  }

  const updates = await getRelatedUpdates(challenge.prop?.id || '');

  return (
    <div className="min-h-screen">
      <PropHeader challenge={challenge} />
      <div className="container mx-auto px-4 py-4">
        <RulesTabs challenge={challenge} categories={categories} />
        {updates.length > 0 && (
          <div className="mt-8 pb-8">
            <RelatedUpdates updates={updates} />
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { propSlug, challengeSlug } = await params;
  const challenge = await getChallengeBySlug(propSlug, challengeSlug);
  if (!challenge) return { title: 'No encontrado' };
  return {
    title: `${challenge.prop?.name} - ${challenge.name} | PropRules`,
    description: `Reglas de ${challenge.name} de ${challenge.prop?.name}. Drawdown, objetivos, trading y condiciones de pago.`,
  };
}
