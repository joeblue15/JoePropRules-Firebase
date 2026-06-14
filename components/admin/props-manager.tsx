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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreHorizontal, Pencil, Copy, Trash, ChevronRight, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import type { Prop, Challenge } from '@/lib/types';

function LogoUrlInput({ defaultValue }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue || '');
  const [imgError, setImgError] = useState(false);

  const hasUrl = url.trim().length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="logo_url">Logo URL</Label>
      <Input
        id="logo_url"
        name="logo_url"
        placeholder="https://..."
        value={url}
        onChange={(e) => { setUrl(e.target.value); setImgError(false); }}
      />
      <div className="h-20 w-full rounded-lg border border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden">
        {!hasUrl ? (
          <span className="text-xs text-muted-foreground">El preview aparecerá aquí</span>
        ) : imgError ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageOff className="h-5 w-5" />
            <span className="text-xs">URL inválida o no carga</span>
          </div>
        ) : (
          <img
            src={url}
            alt="Logo preview"
            className="max-h-full max-w-full object-contain p-2"
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
        )}
      </div>
    </div>
  );
}

export function PropsManager() {
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProp, setEditingProp] = useState<Prop | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);

  useEffect(() => {
    fetchProps();
  }, []);

  const fetchProps = async () => {
    setLoading(true);
    try {
      // TODO: Implement Firestore query
      setProps([]);
    } catch {
      toast.error('Error al cargar props');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    const prop: Record<string, unknown> = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      logo_url: formData.get('logo_url') || null,
      website_url: formData.get('website_url') || null,
      type: formData.get('type'),
      is_active: formData.get('is_active') === 'true',
    };

    try {
      // TODO: Implement Firestore operations
      if (editingProp) {
        toast.success('Prop actualizada');
      } else {
        toast.success('Prop creada');
      }
      setDialogOpen(false);
      setEditingProp(null);
      fetchProps();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta prop?')) return;
    try {
      // TODO: Implement Firestore delete
      toast.success('Prop eliminada');
      fetchProps();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleDuplicate = async (prop: Prop) => {
    const newProp = { ...prop, name: `${prop.name} (copia)`, slug: `${prop.slug}-copia` };
    delete (newProp as { id?: string }).id;
    delete (newProp as { created_at?: string }).created_at;
    delete (newProp as { updated_at?: string }).updated_at;

    try {
      // TODO: Implement Firestore insert
      toast.success('Prop duplicada');
      fetchProps();
    } catch {
      toast.error('Error al duplicar');
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{props.length} props</p>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingProp(null); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Prop
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProp ? 'Editar Prop' : 'Nueva Prop'}</DialogTitle>
              <DialogDescription>Completa la información de la prop firm</DialogDescription>
            </DialogHeader>
            <form action={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={editingProp?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" name="slug" defaultValue={editingProp?.slug} required />
              </div>

              {/* Logo con preview */}
              <LogoUrlInput key={editingProp?.id} defaultValue={editingProp?.logo_url || ''} />

              <div className="space-y-2">
                <Label htmlFor="website_url">Web URL</Label>
                <Input id="website_url" name="website_url" defaultValue={editingProp?.website_url || ''} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select name="type" defaultValue={editingProp?.type || 'cfd'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cfd">CFD</SelectItem>
                    <SelectItem value="futures">Futuros</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="is_active" defaultValue={editingProp?.is_active !== false ? 'true' : 'false'}>
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

      <div className="space-y-2">
        {props.map((prop) => (
          <Card key={prop.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div
                className="flex items-center gap-4 flex-1 min-w-0"
                onClick={() => setSelectedProp(selectedProp?.id === prop.id ? null : prop)}
              >
                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {prop.logo_url ? (
                    <img src={prop.logo_url} alt={prop.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">{prop.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{prop.name}</span>
                    <Badge variant={prop.is_active ? 'default' : 'secondary'} className="text-xs">
                      {prop.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {prop.type === 'cfd' ? 'CFD' : prop.type === 'futures' ? 'Futuros' : 'Ambos'}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{prop.slug}</span>
                </div>
                <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${selectedProp?.id === prop.id ? 'rotate-90' : ''}`} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setEditingProp(prop); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(prop)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(prop.id)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>

            {selectedProp?.id === prop.id && (
              <div className="border-t px-4 py-4 bg-muted/30">
                <ChallengesManager propId={prop.id} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChallengesManager({ propId }: { propId: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [propId]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const db = (await import('@/lib/firebase/client')).db;
      const { data, error } = await db
        .from('challenges')
        .select('*')
        .eq('prop_id', propId)
        .order('name');
      if (error) throw error;
      setChallenges(data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    const tagsRaw = String(formData.get('tags') || '');
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    const challenge = {
      prop_id: propId,
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || null,
      tags: tags.length > 0 ? tags : [],
      is_active: formData.get('is_active') === 'true',
    };

    try {
      // @ts-ignore
      const db = (await import('@/lib/firebase/client')).db;
      if (editingChallenge) {
        const { error } = await db.from('challenges').update(challenge).eq('id', editingChallenge.id);
        if (error) throw error;
        toast.success('Challenge actualizado');
      } else {
        const { error } = await db.from('challenges').insert(challenge);
        if (error) throw error;
        toast.success('Challenge creado');
      }
      setDialogOpen(false);
      setEditingChallenge(null);
      fetchChallenges();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este challenge?')) return;
    try {
      // @ts-ignore
      const db = (await import('@/lib/firebase/client')).db;
      await db.from('challenges').delete().eq('id', id);
      toast.success('Challenge eliminado');
      fetchChallenges();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Challenges</h4>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingChallenge(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingChallenge ? 'Editar Challenge' : 'Nuevo Challenge'}</DialogTitle>
            </DialogHeader>
            <form action={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="name" defaultValue={editingChallenge?.name} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input name="slug" defaultValue={editingChallenge?.slug} required />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea name="description" defaultValue={editingChallenge?.description || ''} />
              </div>
              <div className="space-y-2">
                <Label>Tags (separados por coma)</Label>
                <Input
                  name="tags"
                  placeholder="2 Fases, Estándar, Más popular"
                  defaultValue={editingChallenge?.tags?.join(', ') || ''}
                />
                <p className="text-xs text-muted-foreground">Ej: 2 Fases, Estándar, Más popular</p>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select name="is_active" defaultValue={editingChallenge?.is_active !== false ? 'true' : 'false'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : challenges.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay challenges</p>
      ) : (
        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div>
                <span className="font-medium">{challenge.name}</span>
                <Badge variant={challenge.is_active ? 'default' : 'secondary'} className="ml-2 text-xs">
                  {challenge.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setEditingChallenge(challenge); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(challenge.id)}>
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
