'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Trash, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Prop, Update } from '@/lib/types';

interface UpdateWithProp extends Update {
  props?: { name: string } | null;
}

export function UpdatesManager() {
  const [updates, setUpdates] = useState<UpdateWithProp[]>([]);
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<UpdateWithProp | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;

      const [updatesRes, propsRes] = await Promise.all([
        supabase.from('updates').select('*, props(name)').order('created_at', { ascending: false }),
        supabase.from('props').select('*').order('name'),
      ]);

      if (updatesRes.error) throw updatesRes.error;
      if (propsRes.error) throw propsRes.error;

      setUpdates(updatesRes.data || []);
      setProps(propsRes.data || []);
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    const update = {
      prop_id: formData.get('prop_id'),
      title: formData.get('title'),
      summary: formData.get('summary'),
      content: formData.get('content') || null,
      type: formData.get('type'),
      category: formData.get('category') || 'general',
      is_active: formData.get('is_active') === 'true',
    };

    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;

      if (editingUpdate) {
        const { error } = await supabase
          .from('updates')
          .update(update)
          .eq('id', editingUpdate.id);
        if (error) throw error;
        toast.success('Actualización guardada');
      } else {
        const { error } = await supabase
          .from('updates')
          .insert(update);
        if (error) throw error;
        toast.success('Actualización creada');
      }

      setDialogOpen(false);
      setEditingUpdate(null);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta actualización?')) return;

    try {
      // @ts-ignore
      const supabase = (await import('@/lib/supabase/client')).supabase;
      const { error } = await supabase
        .from('updates')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Actualización eliminada');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const typeConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    critical: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  }

  return (
    <>
      <Toaster />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{updates.length} actualizaciones</p>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingUpdate(null); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva actualización
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingUpdate ? 'Editar actualización' : 'Nueva actualización'}</DialogTitle>
              </DialogHeader>
              <form action={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Prop Firm</Label>
                  <Select name="prop_id" defaultValue={editingUpdate?.prop_id || ''} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prop firm" />
                    </SelectTrigger>
                    <SelectContent>
                      {props.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>
                          {prop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input name="title" defaultValue={editingUpdate?.title} required />
                </div>

                <div className="space-y-2">
                  <Label>Resumen</Label>
                  <Textarea name="summary" defaultValue={editingUpdate?.summary} required />
                </div>

                <div className="space-y-2">
                  <Label>Contenido detallado (opcional)</Label>
                  <Textarea name="content" defaultValue={editingUpdate?.content || ''} rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select name="category" defaultValue={editingUpdate?.category || 'general'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reglas">Reglas</SelectItem>
                        <SelectItem value="restricciones">Restricciones</SelectItem>
                        <SelectItem value="payout">Payout</SelectItem>
                        <SelectItem value="trading">Trading</SelectItem>
                        <SelectItem value="kyc">KYC</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Severidad</Label>
                    <Select name="type" defaultValue={editingUpdate?.type || 'info'}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Atención</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select name="is_active" defaultValue={editingUpdate?.is_active !== false ? 'true' : 'false'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activa</SelectItem>
                      <SelectItem value="false">Inactiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {updates.map((update) => {
            const config = typeConfig[update.type];
            const Icon = config.icon;

            return (
              <Card key={update.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {update.props?.name || 'Sin prop'}
                          </Badge>
                          <Badge variant={update.type === 'critical' ? 'destructive' : update.type === 'warning' ? 'default' : 'outline'} className="text-xs">
                            {update.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(update.created_at), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                        <h4 className="font-medium">{update.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {update.summary}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingUpdate(update);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(update.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
