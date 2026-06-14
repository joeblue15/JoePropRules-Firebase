import { db } from './firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import type {
  Prop,
  PropWithDetails,
  Challenge,
  ChallengeWithDetails,
  Rule,
  Update,
  Discount,
  HeroContent,
  ChallengeScore,
  CategoryType,
} from './types';

export async function getHeroContent(): Promise<{ title: string; subtitle: string }> {
  try {
    const docRef = doc(db, 'hero_content', 'default');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as { title: string; subtitle: string };
    }

    return {
      title: 'Encuentra las reglas que las prop firms no destacan.',
      subtitle: 'Drawdown, consistencia, payout, lotes máximos y restricciones explicadas de forma simple para que sepas exactamente qué estás comprando antes de pagar un challenge.',
    };
  } catch (error) {
    return {
      title: 'Encuentra las reglas que las prop firms no destacan.',
      subtitle: 'Drawdown, consistencia, payout, lotes máximos y restricciones explicadas de forma simple para que sepas exactamente qué estás comprando antes de pagar un challenge.',
    };
  }
}

export async function getProps(type?: 'cfd' | 'futures' | 'both'): Promise<Prop[]> {
  try {
    let q = query(collection(db, 'props'), where('is_active', '==', true));

    if (type && type !== 'both') {
      q = query(collection(db, 'props'), where('is_active', '==', true), where('type', 'in', [type, 'both']));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prop));
  } catch (error) {
    console.error('Error fetching props:', error);
    return [];
  }
}

export async function getPropBySlug(slug: string): Promise<PropWithDetails | null> {
  try {
    const q = query(collection(db, 'props'), where('slug', '==', slug), where('is_active', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const prop = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Prop;

    // Get challenges
    const challengesQuery = query(collection(db, 'challenges'), where('prop_id', '==', prop.id), where('is_active', '==', true));
    const challengesSnapshot = await getDocs(challengesQuery);
    const challenges = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));

    // Get discounts
    const discountsQuery = query(collection(db, 'discounts'), where('prop_id', '==', prop.id), where('is_active', '==', true));
    const discountsSnapshot = await getDocs(discountsQuery);
    const discounts = discountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount));

    return {
      ...prop,
      challenges,
      discounts,
    };
  } catch (error) {
    console.error('Error fetching prop by slug:', error);
    return null;
  }
}

export async function getChallengeBySlug(
  propSlug: string,
  challengeSlug: string
): Promise<ChallengeWithDetails | null> {
  try {
    const prop = await getPropBySlug(propSlug);
    if (!prop) return null;

    const challenge = prop.challenges?.find((c) => c.slug === challengeSlug);
    if (!challenge) return null;

    // Get rules
    const rulesQuery = query(collection(db, 'rules'), where('challenge_id', '==', challenge.id));
    const rulesSnapshot = await getDocs(rulesQuery);
    const rules = rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rule));

    // Get score
    const scoreRef = doc(db, 'challenge_scores', challenge.id);
    const scoreSnap = await getDoc(scoreRef);
    const score = scoreSnap.exists() ? (scoreSnap.data() as ChallengeScore) : undefined;

    const discount = prop.discounts?.[0] || undefined;

    return {
      ...challenge,
      prop,
      rules,
      score,
      discount,
    };
  } catch (error) {
    console.error('Error fetching challenge by slug:', error);
    return null;
  }
}

export async function getUpdates(limit = 10): Promise<(Update & { prop_name: string; prop_logo_url: string | null; prop_slug: string })[]> {
  try {
    const q = query(
      collection(db, 'updates'),
      where('is_active', '==', true),
      orderBy('created_at', 'desc'),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);
    
    const updates: (Update & { prop_name: string; prop_logo_url: string | null; prop_slug: string })[] = [];
    
    for (const doc of querySnapshot.docs) {
      const update = { id: doc.id, ...doc.data() } as Update;
      
      // Get prop details
      const propRef = doc(db, 'props', update.prop_id);
      const propSnap = await getDoc(propRef);
      
      if (propSnap.exists()) {
        const prop = propSnap.data() as Prop;
        updates.push({
          ...update,
          prop_name: prop.name || 'Unknown',
          prop_logo_url: prop.logo_url || null,
          prop_slug: prop.slug || '',
        });
      }
    }
    
    return updates;
  } catch (error) {
    console.error('Error fetching updates:', error);
    return [];
  }
}

const categoryLabels: Record<CategoryType, string> = {
  riesgo: 'Riesgo',
  objetivos: 'Objetivos',
  trading: 'Trading',
  restricciones: 'Restricciones Especiales',
  financiada: 'Financiada',
  legal: 'Legal',
  letra_pequena: 'La Letra Pequeña',
};

export function getCategoryLabel(category: CategoryType): string {
  return categoryLabels[category];
}
