import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">P</span>
              </div>
              <span className="font-bold">PropRules</span>
            </div>
            <p className="text-xs text-muted-foreground">
              La referencia para entender las reglas de las prop firms.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/cfd" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CFD</Link>
            <Link href="/futuros" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Futuros</Link>
            <Link href="/actualizaciones" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Actualizaciones</Link>
          </nav>
        </div>
        <div className="mt-6 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            La información de PropRules es orientativa. Consulta siempre las reglas oficiales antes de operar.
          </p>
        </div>
      </div>
    </footer>
  );
}
