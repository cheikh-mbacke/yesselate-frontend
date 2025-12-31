'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisioPage() {
  const { darkMode } = useAppStore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📹 Visio Conférence
            <Badge variant="warning">Bientôt disponible</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Module de visioconférence intégré
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <Card className="border-amber-500/30">
        <CardContent className="py-16 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">
            Fonctionnalité en cours de développement
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Le module de visioconférence sera bientôt disponible. 
            Il permettra d&apos;organiser des réunions virtuelles directement 
            depuis la plateforme YESSALATE BMO.
          </p>
          <Badge variant="info" className="text-sm">
            Version prévue: V1.2
          </Badge>
        </CardContent>
      </Card>

      {/* Fonctionnalités prévues */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              🎥 Réunions vidéo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">
              Organisez des réunions vidéo avec vos équipes et partenaires 
              directement depuis l&apos;interface BMO.
            </p>
            <ul className="mt-2 text-xs space-y-1 text-slate-500">
              <li>• HD jusqu&apos;à 1080p</li>
              <li>• Jusqu&apos;à 50 participants</li>
              <li>• Partage d&apos;écran</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              📅 Planification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">
              Planifiez vos réunions et synchronisez-les automatiquement 
              avec le calendrier BMO.
            </p>
            <ul className="mt-2 text-xs space-y-1 text-slate-500">
              <li>• Invitations automatiques</li>
              <li>• Rappels par email/push</li>
              <li>• Récurrence configurable</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              💬 Chat intégré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">
              Communiquez en temps réel pendant les réunions avec 
              le chat intégré.
            </p>
            <ul className="mt-2 text-xs space-y-1 text-slate-500">
              <li>• Messages texte</li>
              <li>• Partage de fichiers</li>
              <li>• Réactions emoji</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              🎙️ Enregistrement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">
              Enregistrez vos réunions pour les revoir ultérieurement 
              ou les partager.
            </p>
            <ul className="mt-2 text-xs space-y-1 text-slate-500">
              <li>• Enregistrement cloud</li>
              <li>• Transcription automatique</li>
              <li>• Résumé IA</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              🔗 Intégration projets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">
              Liez vos réunions aux projets et dossiers BMO pour 
              une traçabilité complète.
            </p>
            <ul className="mt-2 text-xs space-y-1 text-slate-500">
              <li>• Lien avec projets</li>
              <li>• Comptes-rendus automatiques</li>
              <li>• Suivi des décisions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              🌐 Accès externe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">
              Invitez des participants externes (clients, fournisseurs) 
              sans compte YESSALATE.
            </p>
            <ul className="mt-2 text-xs space-y-1 text-slate-500">
              <li>• Lien d&apos;invitation</li>
              <li>• Salle d&apos;attente</li>
              <li>• Accès sécurisé</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className={cn(
        'border-2 border-dashed',
        darkMode ? 'border-slate-600' : 'border-gray-300'
      )}>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Vous souhaitez être informé dès que cette fonctionnalité sera disponible ?
          </p>
          <Button variant="secondary">
            🔔 M&apos;avertir du lancement
          </Button>
        </CardContent>
      </Card>

      {/* Alternative temporaire */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">
                En attendant...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Vous pouvez utiliser les intégrations existantes avec Zoom, Google Meet 
                ou Microsoft Teams via le calendrier BMO. Les liens de réunion sont 
                automatiquement ajoutés aux événements planifiés.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="secondary">
                  📅 Voir le calendrier
                </Button>
                <Button size="sm" variant="secondary">
                  🔗 Configurer intégrations
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
