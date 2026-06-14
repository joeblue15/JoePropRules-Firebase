import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
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
  try {
    // Get prop by slug
    const q = query(collection(db, 'props'), where('slug', '==', propSlug), where('is_active', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    const prop = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };

    // Get challenge by slug and prop_id
    const challengeQuery = query(
      collection(db, 'challenges'),
      where('prop_id', '==', prop.id),
      where('slug', '==', challengeSlug),
      where('is_active', '==', true)
    );
    const challengeSnapshot = await getDocs(challengeQuery);
    
    if (challengeSnapshot.empty) return null;
    const challenge = { id: challengeSnapshot.docs[0].id, ...challengeSnapshot.docs[0].data() };

    // Get rules, score, and discounts in parallel
    const [rulesSnapshot, scoreDoc, discountsSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'rules'), where('challenge_id', '==', challenge.id))),
      getDoc(doc(db, 'challenge_scores', challenge.id)),
      getDocs(query(collection(db, 'discounts'), where('prop_id', '==', prop.id), where('is_active', '==', true)))
    ]);

    return {
      ...challenge,
      prop,
      rules: rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      score: scoreDoc.exists() ? (scoreDoc.data() as any) : undefined,
      discount: discountsSnapshot.empty ? undefined : { id: discountsSnapshot.docs[0].id, ...discountsSnapshot.docs[0].data() },
    };
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }
}

async function getRelatedUpdates(propId: string) {
  try {
    const q = query(
      collection(db, 'updates'),
      where('prop_id', '==', propId),
      where('is_active', '==', true),
      orderBy('created_at', 'desc'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching updates:', error);
    return [];
  }
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
