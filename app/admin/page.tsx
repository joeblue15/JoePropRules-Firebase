'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PropsManager } from '@/components/admin/props-manager';
import { HeroEditor } from '@/components/admin/hero-editor';
import { UpdatesManager } from '@/components/admin/updates-manager';
import { RulesManager } from '@/components/admin/rules-manager';
import { DiscountsManager } from '@/components/admin/discounts-manager';
import { Building2, Type, Bell, BookOpen, Tag } from 'lucide-react';

const tabs = [
  { value: 'props',       icon: Building2, label: 'Props',          shortLabel: 'Props' },
  { value: 'reglas',      icon: BookOpen,  label: 'Reglas',         shortLabel: 'Reglas' },
  { value: 'descuentos',  icon: Tag,       label: 'Descuentos',     shortLabel: 'Dctos' },
  { value: 'updates',     icon: Bell,      label: 'Actualizaciones',shortLabel: 'Updates' },
  { value: 'hero',        icon: Type,      label: 'Hero',           shortLabel: 'Hero' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('props');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-1">Gestiona todo el contenido del sitio</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full sm:w-auto gap-1 overflow-x-auto">
          {tabs.map(({ value, icon: Icon, label, shortLabel }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 shrink-0">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="props">
            <Card>
              <CardHeader>
                <CardTitle>Props y Challenges</CardTitle>
                <CardDescription>Crea y edita prop firms y sus challenges</CardDescription>
              </CardHeader>
              <CardContent>
                <PropsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reglas">
            <Card>
              <CardHeader>
                <CardTitle>Editor de Reglas</CardTitle>
                <CardDescription>
                  Selecciona una prop firm y un challenge para editar sus reglas, alertas, casos reales y scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RulesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="descuentos">
            <Card>
              <CardHeader>
                <CardTitle>Descuentos y Afiliados</CardTitle>
                <CardDescription>Gestiona códigos de descuento y links de afiliado por prop firm</CardDescription>
              </CardHeader>
              <CardContent>
                <DiscountsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Actualizaciones</CardTitle>
                <CardDescription>Gestiona las actualizaciones recientes de prop firms</CardDescription>
              </CardHeader>
              <CardContent>
                <UpdatesManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Edita el título y subtítulo principal del sitio</CardDescription>
              </CardHeader>
              <CardContent>
                <HeroEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
