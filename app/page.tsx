import { getProps, getHeroContent, getUpdates } from '@/lib/data';
import { PropCard } from '@/components/prop-card';
import { HomeUpdates } from '@/components/home-updates';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function Home() {
  const [hero, cfdProps, futuresProps, updates] = await Promise.all([
    getHeroContent(),
    getProps('cfd'),
    getProps('futures'),
    getUpdates(6),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/80 mb-5">
              Reglas claras, decisiones inteligentes
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-foreground">Encuentra las reglas que las</span>
              <br />
              <span className="text-gradient">prop firms no destacan.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* CFD */}
      <section id="cfd" className="pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight inline-flex items-center gap-2">
                CFD
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Prop firms que ofrecen cuentas CFD.
              </p>
            </div>
            <Link
              href="/cfd"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {cfdProps.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {cfdProps.map((prop) => (
                <PropCard key={prop.id} prop={prop} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No hay props disponibles.</p>
          )}
        </div>
      </section>

      {/* Futuros */}
      <section id="futuros" className="pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Futuros</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Prop firms que ofrecen cuentas de futuros.
              </p>
            </div>
            <Link
              href="/futuros"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {futuresProps.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {futuresProps.map((prop) => (
                <PropCard key={prop.id} prop={prop} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No hay props disponibles.</p>
          )}
        </div>
      </section>

      {/* Updates */}
      <section id="actualizaciones" className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Actualizaciones recientes</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cambios recientes de las principales prop firms.
              </p>
            </div>
            <Link
              href="/actualizaciones"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todo el historial <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <HomeUpdates updates={updates} />
        </div>
      </section>
    </div>
  );
}
