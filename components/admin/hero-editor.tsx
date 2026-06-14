'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
}

export function HeroEditor() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .single();

      if (error) throw error;
      setHero(data);
    } catch {
      toast.error('Error al cargar hero');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hero) return;

    setSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;
      const { error } = await supabase
        .from('hero_content')
        .update({
          title: formData.get('title'),
          subtitle: formData.get('subtitle'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', hero.id);

      if (error) throw error;
      toast.success('Hero actualizado');
      fetchHero();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>;
  }

  if (!hero) {
    return <p className="text-muted-foreground">No se encontró el hero</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={hero.title}
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Textarea
          id="subtitle"
          name="subtitle"
          defaultValue={hero.subtitle}
          rows={3}
          className="text-base"
        />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-2">Vista previa</p>
          <h1 className="text-2xl font-bold mb-2">{hero.title}</h1>
          <p className="text-muted-foreground">{hero.subtitle}</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
