'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash, Tag, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Prop, Discount } from '@/lib/types';

interface DiscountWithProp extends Discount {
  props?: { name: string } | null;
}

export function DiscountsManager() {
  const [discounts, setDiscounts] = useState<DiscountWithProp[]>([]);
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountWithProp | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;
      const [discountsRes, propsRes] = await Promise.all([
        supabase.from('discounts').select('*, props(name)').order('created_at', { ascending: false }),
        supabase.from('props').select('*').order('name'),
      ]);
      if (discountsRes.error) throw discountsRes.error;
      setDiscounts(discountsRes.data || []);
      setProps(propsRes.data || []);
    } catch {
      toast.error('Error al cargar descuentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    const payload = {
      prop_id: formData.get('prop_id'),
      code: formData.get('code'),
      discount_percentage: formData.get('discount_percentage') ? Number(formData.get('discount_percentage')) : null,
      affiliate_url: formData.get('affiliate_url') || null,
      expires_at: formData.get('expires_at') || null,
      is_active: formData.get('is_active') === 'true',
    };

    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;
      if (editing) {
        const { error } = await supabase.from('discounts').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Descuento actualizado');
      } else {
        const { error } = await supabase.from('discounts').insert(payload);
        if (error) throw error;
        toast.success('Descuento creado');
      }
      setDialogOpen(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este descuento?')) return;
    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;
      await supabase.from('discounts').delete().eq('id', id);
      toast.success('Descuento eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{discounts.length} descuentos</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo descuento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar descuento' : 'Nuevo descuento'}</DialogTitle>
            </DialogHeader>
            <form action={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Prop Firm</Label>
                <Select name="prop_id" defaultValue={editing?.prop_id || ''}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar prop..." /></SelectTrigger>
                  <SelectContent>
                    {props.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input name="code" defaultValue={editing?.code || ''} required placeholder="PROP10" />
                </div>
                <div className="space-y-2">
                  <Label>% Descuento</Label>
                  <Input name="discount_percentage" type="number" min={0} max={100}
                    defaultValue={editing?.discount_percentage ?? ''} placeholder="10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL de afiliado</Label>
                <Input name="affiliate_url" defaultValue={editing?.affiliate_url || ''} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Expira el</Label>
                  <Input name="expires_at" type="date"
                    defaultValue={editing?.expires_at ? editing.expires_at.split('T')[0] : ''} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select name="is_active" defaultValue={editing?.is_active !== false ? 'true' : 'false'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {discounts.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl">
          No hay descuentos. Crea el primero.
        </div>
      ) : (
        <div className="space-y-2">
          {discounts.map((d) => {
            const propName = (d.props as { name?: string } | null)?.name || 'Sin prop';
            return (
              <Card key={d.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Tag className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono font-bold text-sm">{d.code}</span>
                      {d.discount_percentage && (
                        <Badge variant="secondary" className="text-xs">{d.discount_percentage}% off</Badge>
                      )}
                      <Badge variant={d.is_active ? 'default' : 'secondary'} className="text-xs">
                        {d.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{propName}</span>
                      {d.affiliate_url && (
                        <a href={d.affiliate_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline">
                          Ver enlace <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {d.expires_at && (
                        <span>Expira: {new Date(d.expires_at).toLocaleDateString('es')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => { setEditing(d); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => handleDelete(d.id)}>
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
