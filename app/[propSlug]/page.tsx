import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ propSlug: string }>;
}

async function getProp(slug: string) {
  const { data: prop } = await db
    .from('props')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (!prop) return null;

  const { data: challenges } = await db
    .from('challenges')
    .select('*')
    .eq('prop_id', prop.id)
    .eq('is_active', true)
    .order('name');

  return { ...prop, challenges: challenges || [] };
}

export default async function PropPage({ params }: PageProps) {
  const { propSlug } = await params;
  const prop = await getProp(propSlug);

  if (!prop) notFound();

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${prop.type === 'futures' ? 'futuros' : 'cfd'}`} className="hover:text-foreground transition-colors uppercase">
          {prop.type === 'futures' ? 'Futuros' : 'CFD'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{prop.name}</span>
      </nav>

      <div className="flex items-start gap-5 mb-8">
        <div className="h-20 w-20 rounded-xl border border-border/60 bg-card flex items-center justify-center shrink-0 p-3 overflow-hidden">
          {prop.logo_url ? (
            <img src={prop.logo_url} alt={prop.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">{prop.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">{prop.name}</h1>
          {prop.website_url && (
            <a
              href={prop.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Sitio oficial <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Challenges disponibles</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {prop.challenges.map((challenge: { id: string; slug: string; name: string; description: string | null; is_active: boolean }) => (
          <Link
            key={challenge.id}
            href={`/${prop.slug}/${challenge.slug}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-muted-foreground">
                {challenge.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{challenge.name}</div>
              {challenge.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{challenge.description}</p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { propSlug } = await params;
  const prop = await getProp(propSlug);
  if (!prop) return { title: 'No encontrado' };
  return {
    title: `${prop.name} - Reglas y Challenges | PropRules`,
    description: `Challenges y reglas de ${prop.name}.`,
  };
}
