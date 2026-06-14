export interface Prop {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  type: 'cfd' | 'futures' | 'both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  prop_id: string;
  name: string;
  slug: string;
  description: string | null;
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rule {
  id: string;
  challenge_id: string;
  category: CategoryType;
  content: Record<string, unknown>;
  alerts: Alert[];
  interpretations: Interpretation[];
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'riesgo' | 'objetivos' | 'trading' | 'restricciones' | 'financiada' | 'legal' | 'letra_pequena';

export interface Alert {
  type: 'warning' | 'info' | 'critical';
  message: string;
}

export interface Interpretation {
  title: string;
  content: string;
}

export interface Update {
  id: string;
  prop_id: string;
  title: string;
  summary: string;
  content: string | null;
  type: 'info' | 'warning' | 'critical';
  category?: 'reglas' | 'restricciones' | 'payout' | 'trading' | 'kyc' | 'general';
  is_active: boolean;
  created_at: string;
}

export interface Discount {
  id: string;
  prop_id: string;
  code: string;
  discount_percentage: number | null;
  affiliate_url: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  updated_at: string;
}

export interface ChallengeScore {
  id: string;
  challenge_id: string;
  overall_score: number;
  riesgo_score: number;
  objetivos_score: number;
  trading_score: number;
  financiada_score: number;
  updated_at: string;
}

export interface PropWithDetails extends Prop {
  challenges?: Challenge[];
  discounts?: Discount[];
}

export interface ChallengeWithDetails extends Challenge {
  prop?: Prop;
  rules?: Rule[];
  score?: ChallengeScore;
  discount?: Discount;
}
