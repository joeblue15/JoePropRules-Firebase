import { getProps } from '@/lib/data';
import { PropCard } from '@/components/prop-card';

export default async function FuturosPage() {
  const props = await getProps('futures');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Prop Firms de Futuros</h1>
        <p className="text-muted-foreground mt-2">
          Prop firms que ofrecen cuentas de futuros. Encuentra las reglas de cada una.
        </p>
      </div>

      {props.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No hay props disponibles.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {props.map((prop) => (
            <PropCard key={prop.id} prop={prop} />
          ))}
        </div>
      )}
    </div>
  );
}
