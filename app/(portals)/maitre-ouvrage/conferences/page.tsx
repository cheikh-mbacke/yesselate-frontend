'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { conferencesDecisionnelles, coordinationStats } from '@/lib/data';

export default function ConferencesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'planifiee' | 'terminee'>('all');
  const [selectedConf, setSelectedConf] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'agenda' | 'participants' | 'summary'>('agenda');

  const filteredConfs = conferencesDecisionnelles.filter(c => filter === 'all' || c.status === filter);
  const stats = coordinationStats.conferences;

  const selected = selectedConf ? conferencesDecisionnelles.find(c => c.id === selectedConf) : null;

  const handleCreateFromDossier = () => {
    addActionLog({
      module: 'conferences',
      action: 'create_from_dossier',
      targetId: 'NEW',
      targetType: 'Conference',
      details: 'Création conférence depuis dossier',
      status: 'info',
    });
    addToast('Sélectionnez un dossier bloqué, arbitrage ou risque critique', 'info');
  };

  const handleJoinConference = (conf: typeof selected) => {
    if (!conf) return;
    addActionLog({
      module: 'conferences',
      action: 'join',
      targetId: conf.id,
      targetType: 'Conference',
      details: `Connexion conférence ${conf.title}`,
      status: 'success',
    });
    if (conf.visioLink) {
      addToast('Ouverture du lien visio...', 'success');
    }
  };

  const handleGenerateSummary = (conf: typeof selected) => {
    if (!conf) return;
    addActionLog({
      module: 'conferences',
      action: 'generate_summary',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Génération compte-rendu IA',
      status: 'info',
      hash: `SHA3-256:sum_${Date.now().toString(16)}`,
    });
    addToast('Génération du compte-rendu IA en cours...', 'info');
  };

  const handleValidateSummary = (conf: typeof selected) => {
    if (!conf || !conf.summary) return;
    addActionLog({
      module: 'conferences',
      action: 'validate_summary',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Validation compte-rendu par humain',
      status: 'success',
      hash: `SHA3-256:val_${Date.now().toString(16)}`,
    });
    addToast('Compte-rendu validé - Décisions extraites vers registre', 'success');
  };

  const handleExtractDecisions = (conf: typeof selected) => {
    if (!conf) return;
    addActionLog({
      module: 'conferences',
      action: 'extract_decisions',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Extraction décisions vers registre',
      status: 'success',
    });
    addToast('Décisions extraites et hashées', 'success');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { crise: '🚨', arbitrage: '⚖️', revue_projet: '📊', comite_direction: '👔', resolution_blocage: '🔓' };
    return icons[type] || '📹';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'urgent'> = { normale: 'default', haute: 'info', urgente: 'warning', critique: 'urgent' };
    return variants[priority] || 'default';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📹 Conférences Décisionnelles
            <Badge variant="info">{stats.planifiees} planifiée(s)</Badge>
          </h1>
          <p className="text-sm text-slate-400">Visio liées aux dossiers avec compte-rendu IA et extraction de décisions</p>
        </div>
        <Button onClick={handleCreateFromDossier}>+ Créer depuis dossier</Button>
      </div>

      {/* Principe clé */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <h3 className="font-bold text-purple-400">Pas un simple appel visio</h3>
              <p className="text-sm text-slate-400">Chaque conférence est liée à un contexte (dossier bloqué, arbitrage, risque). Ordre du jour auto-généré. Décisions extraites et hashées.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info visio intégrée */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-blue-400">
                Visioconférence intégrée (Bientôt disponible)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Le module de visioconférence intégré sera bientôt disponible. En attendant, vous pouvez utiliser les intégrations existantes avec Zoom, Google Meet ou Microsoft Teams via le calendrier BMO. Les liens de réunion sont automatiquement ajoutés aux événements planifiés.
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.planifiees}</p>
            <p className="text-[10px] text-slate-400">Planifiées</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.terminees}</p>
            <p className="text-[10px] text-slate-400">Terminées</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-pink-400">{stats.decisionsGenerees}</p>
            <p className="text-[10px] text-slate-400">Décisions générées</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'planifiee', label: '📅 Planifiées' },
          { id: 'terminee', label: '✅ Terminées' },
        ].map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste conférences */}
        <div className="lg:col-span-2 space-y-3">
          {filteredConfs.map((conf) => {
            const isSelected = selectedConf === conf.id;
            const isUpcoming = conf.status === 'planifiee' && new Date(conf.scheduledAt) > new Date();
            const isSoon = conf.status === 'planifiee' && new Date(conf.scheduledAt) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            return (
              <Card
                key={conf.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50',
                  conf.status === 'planifiee' && conf.priority === 'critique' && 'border-l-4 border-l-red-500',
                  conf.status === 'planifiee' && conf.priority !== 'critique' && 'border-l-4 border-l-amber-500',
                  conf.status === 'terminee' && 'border-l-4 border-l-emerald-500 opacity-80',
                )}
                onClick={() => setSelectedConf(conf.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{getTypeIcon(conf.type)}</span>
                        <span className="font-mono text-xs text-purple-400">{conf.id}</span>
                        <Badge variant={conf.status === 'planifiee' ? 'warning' : conf.status === 'terminee' ? 'success' : 'default'}>{conf.status}</Badge>
                        <Badge variant={getPriorityBadge(conf.priority)}>{conf.priority}</Badge>
                        {isSoon && <Badge variant="urgent" pulse>Bientôt</Badge>}
                      </div>
                      <h3 className="font-bold mt-1">{conf.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">{new Date(conf.scheduledAt).toLocaleDateString('fr-FR')}</p>
                      <p className="text-xs text-slate-400">{new Date(conf.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {conf.duration}min</p>
                    </div>
                  </div>

                  {/* Contexte lié */}
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 mb-3">
                    <p className="text-xs text-blue-400">🔗 Contexte: {conf.linkedContext.type}</p>
                    <p className="text-sm font-medium">{conf.linkedContext.label}</p>
                  </div>

                  {/* Participants preview */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400">Participants:</span>
                    <div className="flex -space-x-2">
                      {conf.participants.slice(0, 4).map((p, idx) => (
                        <div key={idx} className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold" title={p.name}>
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {conf.participants.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[10px]">+{conf.participants.length - 4}</div>
                      )}
                    </div>
                    <Badge variant="default">{conf.location}</Badge>
                  </div>

                  {/* Décisions extraites */}
                  {conf.decisionsExtracted.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="success">✓ {conf.decisionsExtracted.length} décision(s) extraite(s)</Badge>
                    </div>
                  )}

                  {/* Actions */}
                  {conf.status === 'planifiee' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleJoinConference(conf); }}>🔗 Rejoindre</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(selected.type)}</span>
                    <Badge variant={selected.status === 'planifiee' ? 'warning' : 'success'}>{selected.status}</Badge>
                    <Badge variant={getPriorityBadge(selected.priority)}>{selected.priority}</Badge>
                  </div>
                  <span className="font-mono text-xs text-purple-400">{selected.id}</span>
                  <h3 className="font-bold">{selected.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(selected.scheduledAt).toLocaleDateString('fr-FR')} à {new Date(selected.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Contexte */}
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30 mb-4">
                  <p className="text-xs text-blue-400">🔗 {selected.linkedContext.type}</p>
                  <p className="font-medium text-sm">{selected.linkedContext.label}</p>
                  <p className="text-xs text-slate-400 mt-1">ID: {selected.linkedContext.id}</p>
                </div>

                {/* Onglets */}
                <div className="flex gap-1 mb-4">
                  <Button size="sm" variant={viewTab === 'agenda' ? 'default' : 'secondary'} onClick={() => setViewTab('agenda')}>📋 Agenda</Button>
                  <Button size="sm" variant={viewTab === 'participants' ? 'default' : 'secondary'} onClick={() => setViewTab('participants')}>👥 ({selected.participants.length})</Button>
                  {selected.summary && <Button size="sm" variant={viewTab === 'summary' ? 'default' : 'secondary'} onClick={() => setViewTab('summary')}>📝 CR</Button>}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {viewTab === 'agenda' && (
                    selected.agenda.map((item) => (
                      <div key={item.order} className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100", item.decisionRequired && "border-l-2 border-l-amber-500")}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{item.order}. {item.title}</span>
                          <Badge variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'info' : 'default'}>{item.duration}min</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{item.type}</Badge>
                          {item.decisionRequired && <Badge variant="warning">Décision</Badge>}
                        </div>
                        {item.outcome && <p className="text-emerald-400 mt-1">→ {item.outcome}</p>}
                      </div>
                    ))
                  )}

                  {viewTab === 'participants' && (
                    selected.participants.map((p) => (
                      <div key={p.employeeId} className={cn("p-2 rounded text-xs flex items-center justify-between", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-slate-400">{p.bureau} • {p.role}</p>
                        </div>
                        <Badge variant={p.presence === 'confirme' ? 'success' : p.presence === 'decline' ? 'urgent' : 'default'}>{p.presence}</Badge>
                      </div>
                    ))
                  )}

                  {viewTab === 'summary' && selected.summary && (
                    <div className="space-y-3">
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-xs text-slate-400 mb-1">Généré par: {selected.summary.generatedBy}</p>
                        {selected.summary.validatedBy && <p className="text-xs text-emerald-400">✓ Validé par {selected.summary.validatedBy}</p>}
                      </div>
                      <div>
                        <p className="text-xs font-bold mb-1">Points clés</p>
                        {selected.summary.keyPoints.map((kp, idx) => (
                          <p key={idx} className="text-xs text-slate-300">• {kp}</p>
                        ))}
                      </div>
                      {selected.summary.decisionsProposed.length > 0 && (
                        <div>
                          <p className="text-xs font-bold mb-1">Décisions</p>
                          {selected.summary.decisionsProposed.map((d) => (
                            <div key={d.id} className="text-xs p-1 rounded bg-slate-700/20 mb-1">
                              <Badge variant={d.status === 'adopted' ? 'success' : d.status === 'rejected' ? 'urgent' : 'default'}>{d.status}</Badge>
                              <p>{d.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Traçabilité */}
                {selected.agendaGeneratedFrom && (
                  <div className="mt-3 p-2 rounded bg-slate-700/30 text-xs">
                    <p className="text-slate-400">📊 Agenda généré depuis:</p>
                    <p>{selected.agendaGeneratedFrom}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  {selected.status === 'planifiee' && (
                    <Button size="sm" variant="success" onClick={() => handleJoinConference(selected)}>🔗 Rejoindre la conférence</Button>
                  )}
                  {selected.status === 'terminee' && !selected.summary && (
                    <Button size="sm" variant="info" onClick={() => handleGenerateSummary(selected)}>🤖 Générer CR (IA)</Button>
                  )}
                  {selected.summary && selected.summary.generatedBy === 'ia' && (
                    <Button size="sm" variant="success" onClick={() => handleValidateSummary(selected)}>✓ Valider le CR</Button>
                  )}
                  {selected.summary && selected.summary.validatedBy && selected.decisionsExtracted.length === 0 && (
                    <Button size="sm" variant="default" onClick={() => handleExtractDecisions(selected)}>📤 Extraire décisions</Button>
                  )}
                </div>

                {/* Hash */}
                <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/30">
                  <p className="text-[10px] text-purple-400">🔐 Hash</p>
                  <p className="font-mono text-[10px] truncate">{selected.hash}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">📹</span><p className="text-slate-400">Sélectionnez une conférence</p></CardContent></Card>
          )}
        </div>
      </div>

      {/* Fonctionnalités visio prévues */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          🚀 Fonctionnalités visio prévues
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎥</span>
                <h3 className="font-bold text-sm">Réunions vidéo</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Organisez des réunions vidéo avec vos équipes et partenaires directement depuis l&apos;interface BMO.
              </p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• HD jusqu&apos;à 1080p</li>
                <li>• Jusqu&apos;à 50 participants</li>
                <li>• Partage d&apos;écran</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📅</span>
                <h3 className="font-bold text-sm">Planification</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Planifiez vos réunions et synchronisez-les automatiquement avec le calendrier BMO.
              </p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• Invitations automatiques</li>
                <li>• Rappels par email/push</li>
                <li>• Récurrence configurable</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💬</span>
                <h3 className="font-bold text-sm">Chat intégré</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Communiquez en temps réel pendant les réunions avec le chat intégré.
              </p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• Messages texte</li>
                <li>• Partage de fichiers</li>
                <li>• Réactions emoji</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎙️</span>
                <h3 className="font-bold text-sm">Enregistrement</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Enregistrez vos réunions pour les revoir ultérieurement ou les partager.
              </p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• Enregistrement cloud</li>
                <li>• Transcription automatique</li>
                <li>• Résumé IA</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔗</span>
                <h3 className="font-bold text-sm">Intégration projets</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Liez vos réunions aux projets et dossiers BMO pour une traçabilité complète.
              </p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• Lien avec projets</li>
                <li>• Comptes-rendus automatiques</li>
                <li>• Suivi des décisions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌐</span>
                <h3 className="font-bold text-sm">Accès externe</h3>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Invitez des participants externes (clients, fournisseurs) sans compte YESSALATE.
              </p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• Lien d&apos;invitation</li>
                <li>• Salle d&apos;attente</li>
                <li>• Accès sécurisé</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
