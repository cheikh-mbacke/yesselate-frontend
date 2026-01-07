'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { conferencesDecisionnelles, coordinationStats } from '@/lib/data';
import type { ActionLogType } from '@/lib/types/bmo.types';

type FilterStatus = 'all' | 'planifiee' | 'terminee';
type ViewTab = 'agenda' | 'participants' | 'summary';
type SortMode = 'soonest' | 'latest';

type Conference = (typeof conferencesDecisionnelles)[number];

export default function ConferencesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedConf, setSelectedConf] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>('agenda');

  // + Pro: recherche + filtres additionnels + tri
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Conference['type']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Conference['priority']>('all');
  const [sortMode, setSortMode] = useState<SortMode>('soonest');

  const stats = coordinationStats.conferences;

  const nowMs = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const safeDate = (v: any) => {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDateFR = (d: Date) => d.toLocaleDateString('fr-FR');
  const formatTimeFR = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      crise: '🚨',
      arbitrage: '⚖️',
      revue_projet: '📊',
      comite_direction: '👔',
      resolution_blocage: '🔓',
    };
    return icons[type] || '📹';
  };

  const getPriorityBadge = (priority: string) => {
    // NOTE: mapping "priorité" -> variante UI (à adapter si ton design system diffère)
    const variants: Record<string, 'default' | 'info' | 'warning' | 'urgent'> = {
      normale: 'default',
      haute: 'info',
      urgente: 'warning',
      critique: 'urgent',
    };
    return variants[priority] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success'> = {
      planifiee: 'warning',
      terminee: 'success',
    };
    return variants[status] || 'default';
  };

  const normalized = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredConfs = useMemo(() => {
    const q = normalized(searchQuery.trim());

    const base = conferencesDecisionnelles
      .filter((c) => filter === 'all' || c.status === filter)
      .filter((c) => typeFilter === 'all' || c.type === typeFilter)
      .filter((c) => priorityFilter === 'all' || c.priority === priorityFilter)
      .filter((c) => {
        if (!q) return true;
        const haystack = normalized(
          [
            c.id,
            c.title,
            c.location,
            c.linkedContext?.type,
            c.linkedContext?.label,
            c.linkedContext?.id,
            ...(c.participants || []).map((p) => `${p.name} ${p.bureau} ${p.role}`),
          ]
            .filter(Boolean)
            .join(' | ')
        );
        return haystack.includes(q);
      });

    // Tri
    const sorted = [...base].sort((a, b) => {
      const da = safeDate(a.scheduledAt)?.getTime() ?? 0;
      const db = safeDate(b.scheduledAt)?.getTime() ?? 0;

      if (sortMode === 'latest') return db - da;

      // soonest: conférences planifiées d'abord + plus proche d'abord
      const aPlanned = a.status === 'planifiee' ? 0 : 1;
      const bPlanned = b.status === 'planifiee' ? 0 : 1;
      if (aPlanned !== bPlanned) return aPlanned - bPlanned;

      return da - db;
    });

    return sorted;
  }, [filter, typeFilter, priorityFilter, searchQuery, sortMode]);

  const selected = useMemo(() => {
    if (!selectedConf) return null;
    return conferencesDecisionnelles.find((c) => c.id === selectedConf) ?? null;
  }, [selectedConf]);

  // Stabiliser l'onglet quand on change de conf (évite onglet "summary" sans CR)
  const safeViewTab: ViewTab = useMemo(() => {
    if (!selected) return 'agenda';
    if (viewTab === 'summary' && !selected.summary) return 'agenda';
    return viewTab;
  }, [selected, viewTab]);

  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  const log = (payload: {
    module: string;
    action: 'create_from_dossier' | 'join' | 'copy_link' | 'generate_summary' | 'validate_summary' | 'extract_decisions' | 'open_calendar' | 'open_integrations' | 'open_visio';
    targetId: string;
    targetType: string;
    details: string;
  }) => {
    // Mapping des actions internes vers ActionLogType
    const actionMap: Record<string, ActionLogType> = {
      create_from_dossier: 'creation',
      join: 'connexion',
      copy_link: 'audit',
      generate_summary: 'creation',
      validate_summary: 'validation',
      extract_decisions: 'export',
      open_calendar: 'audit',
      open_integrations: 'audit',
      open_visio: 'connexion',
    };

    const actionLogType = actionMap[payload.action] || 'audit';

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: payload.module,
      action: actionLogType,
      targetId: payload.targetId,
      targetType: payload.targetType,
      details: payload.details,
    });
  };

  const openExternal = (url?: string | null) => {
    if (!url) return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // no-op
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateFromDossier = () => {
    log({
      module: 'conferences',
      action: 'create_from_dossier',
      targetId: 'NEW',
      targetType: 'Conference',
      details: 'Création conférence depuis dossier',
    });
    addToast('Sélectionnez un dossier bloqué, arbitrage ou risque critique', 'info');
  };

  const handleJoinConference = (conf: Conference | null) => {
    if (!conf) return;
    log({
      module: 'conferences',
      action: 'join',
      targetId: conf.id,
      targetType: 'Conference',
      details: `Connexion conférence ${conf.title}`,
    });

    if (!conf.visioLink) {
      addToast("Aucun lien visio n'est encore associé à cette conférence.", 'warning');
      return;
    }

    addToast('Ouverture du lien visio...', 'success');
    openExternal(conf.visioLink);
  };

  const handleCopyVisioLink = async (conf: Conference | null) => {
    if (!conf?.visioLink) {
      addToast('Aucun lien visio à copier.', 'warning');
      return;
    }
    log({
      module: 'conferences',
      action: 'copy_link',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Copie lien visio',
    });

    const ok = await copyToClipboard(conf.visioLink);
    addToast(ok ? 'Lien copié ✅' : 'Impossible de copier le lien', ok ? 'success' : 'warning');
  };

  const handleGenerateSummary = (conf: Conference | null) => {
    if (!conf) return;
    log({
      module: 'conferences',
      action: 'generate_summary',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Génération compte-rendu IA',
    });
    addToast('Génération du compte-rendu IA en cours...', 'info');
  };

  const handleValidateSummary = (conf: Conference | null) => {
    if (!conf || !conf.summary) return;
    log({
      module: 'conferences',
      action: 'validate_summary',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Validation compte-rendu par humain',
    });
    addToast('Compte-rendu validé - Décisions extraites vers registre', 'success');
  };

  const handleExtractDecisions = (conf: Conference | null) => {
    if (!conf) return;
    log({
      module: 'conferences',
      action: 'extract_decisions',
      targetId: conf.id,
      targetType: 'Conference',
      details: 'Extraction décisions vers registre',
    });
    addToast('Décisions extraites et hashées', 'success');
  };

  const soonCount = useMemo(() => {
    return conferencesDecisionnelles.filter((c) => {
      if (c.status !== 'planifiee') return false;
      const d = safeDate(c.scheduledAt);
      if (!d) return false;
      const delta = d.getTime() - nowMs;
      return delta > 0 && delta <= DAY_MS;
    }).length;
  }, [nowMs]);

  const criticalPlanned = useMemo(() => {
    return conferencesDecisionnelles.filter((c) => c.status === 'planifiee' && c.priority === 'critique').length;
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📹 Conférences Décisionnelles
            <Badge variant="info">{stats.planifiees} planifiée(s)</Badge>
            {criticalPlanned > 0 && <Badge variant="urgent">Critiques: {criticalPlanned}</Badge>}
            {soonCount > 0 && <Badge variant="warning" pulse>Bientôt: {soonCount}</Badge>}
          </h1>
          <p className="text-sm text-slate-400">
            Visio liées aux dossiers • compte-rendu IA • extraction de décisions • traçabilité (hash)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => addToast('Rafraîchissement...', 'info')}>🔄 Actualiser</Button>
          <Button variant="secondary" onClick={() => addToast('Export en cours...', 'info')}>📦 Exporter</Button>
          <Button onClick={handleCreateFromDossier}>+ Créer depuis dossier</Button>
        </div>
      </div>

      {/* Principe clé */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <h3 className="font-bold text-purple-400">Pas un simple appel visio</h3>
              <p className="text-sm text-slate-400">
                Chaque conférence est liée à un contexte (dossier bloqué, arbitrage, risque).
                Ordre du jour auto-généré. Décisions extraites et hashées.
              </p>
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
              <h3 className="font-bold text-sm text-blue-400">Visioconférence intégrée (Bientôt disponible)</h3>
              <p className="text-xs text-slate-400 mt-1">
                En attendant, utilisez Zoom / Google Meet / Teams via le calendrier BMO.
                Les liens sont ajoutés automatiquement aux événements planifiés.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    log({
                      module: 'conferences',
                      action: 'open_calendar',
                      targetId: 'CAL',
                      targetType: 'Calendar',
                      details: 'Ouverture calendrier BMO',
                    });
                    addToast('Ouverture calendrier...', 'info');
                  }}
                >
                  📅 Voir le calendrier
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    log({
                      module: 'conferences',
                      action: 'open_integrations',
                      targetId: 'INT',
                      targetType: 'Integrations',
                      details: 'Ouverture intégrations visio',
                    });
                    addToast('Configuration intégrations...', 'info');
                  }}
                >
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

      {/* Filtres (statut) + Recherche + Tri */}
      <div className="flex flex-wrap gap-2 items-center">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'planifiee', label: '📅 Planifiées' },
          { id: 'terminee', label: '✅ Terminées' },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'secondary'}
            onClick={() => setFilter(f.id as FilterStatus)}
          >
            {f.label}
          </Button>
        ))}

        <div className="flex-1 min-w-[220px]" />

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔎 Rechercher (ID, titre, contexte, participant...)"
          className={cn(
            'px-3 py-2 rounded-lg text-sm w-full sm:w-[360px]',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />

        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSearchQuery('');
            setTypeFilter('all');
            setPriorityFilter('all');
            setSortMode('soonest');
            setFilter('all');
            addToast('Filtres réinitialisés', 'info');
          }}
        >
          Réinitialiser
        </Button>
      </div>

      {/* Filtres type/priorité + tri */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" variant={typeFilter === 'all' ? 'default' : 'secondary'} onClick={() => setTypeFilter('all')}>
          Type: Tous
        </Button>
        {(['crise', 'arbitrage', 'revue_projet', 'comite_direction', 'resolution_blocage'] as Conference['type'][]).map((t) => (
          <Button key={t} size="sm" variant={typeFilter === t ? 'default' : 'secondary'} onClick={() => setTypeFilter(t)}>
            {getTypeIcon(t)} {t}
          </Button>
        ))}

        <div className="flex-1 min-w-[16px]" />

        <Button size="sm" variant={priorityFilter === 'all' ? 'default' : 'secondary'} onClick={() => setPriorityFilter('all')}>
          Priorité: Toutes
        </Button>
        {(['normale', 'haute', 'urgente', 'critique'] as Conference['priority'][]).map((p) => (
          <Button key={p} size="sm" variant={priorityFilter === p ? 'default' : 'secondary'} onClick={() => setPriorityFilter(p)}>
            <Badge variant={getPriorityBadge(p)} className="mr-2">{p}</Badge>
            {p}
          </Button>
        ))}

        <div className="flex-1 min-w-[16px]" />

        <Button size="sm" variant={sortMode === 'soonest' ? 'default' : 'secondary'} onClick={() => setSortMode('soonest')}>
          ⏱️ Prochaines
        </Button>
        <Button size="sm" variant={sortMode === 'latest' ? 'default' : 'secondary'} onClick={() => setSortMode('latest')}>
          🕒 Récentes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste conférences */}
        <div className="lg:col-span-2 space-y-3">
          {filteredConfs.map((conf) => {
            const isSelected = selectedConf === conf.id;

            const scheduled = safeDate(conf.scheduledAt);
            const scheduledMs = scheduled?.getTime() ?? 0;
            const delta = scheduledMs - nowMs;

            const isSoon = conf.status === 'planifiee' && delta > 0 && delta <= DAY_MS;
            const isOverdue = conf.status === 'planifiee' && scheduled && scheduledMs < nowMs;

            return (
              <Card
                key={conf.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50',
                  conf.status === 'planifiee' && conf.priority === 'critique' && 'border-l-4 border-l-red-500',
                  conf.status === 'planifiee' && conf.priority !== 'critique' && 'border-l-4 border-l-amber-500',
                  conf.status === 'terminee' && 'border-l-4 border-l-emerald-500 opacity-80'
                )}
                onClick={() => {
                  setSelectedConf(conf.id);
                  setViewTab('agenda'); // UX: on repart sur l'agenda à chaque sélection
                }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{getTypeIcon(conf.type)}</span>
                        <span className="font-mono text-xs text-purple-400">{conf.id}</span>
                        <Badge variant={getStatusBadge(conf.status)}>{conf.status}</Badge>
                        <Badge variant={getPriorityBadge(conf.priority)}>{conf.priority}</Badge>
                        {isSoon && <Badge variant="urgent" pulse>Bientôt</Badge>}
                        {isOverdue && <Badge variant="urgent">En retard</Badge>}
                      </div>
                      <h3 className="font-bold mt-1">{conf.title}</h3>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-sm">{scheduled ? formatDateFR(scheduled) : 'Date inconnue'}</p>
                      <p className="text-xs text-slate-400">
                        {scheduled ? `${formatTimeFR(scheduled)} • ${conf.duration}min` : `${conf.duration}min`}
                      </p>
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
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold"
                          title={p.name}
                        >
                          {p.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                      ))}
                      {conf.participants.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-[10px]">
                          +{conf.participants.length - 4}
                        </div>
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
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinConference(conf);
                        }}
                      >
                        🔗 Rejoindre
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyVisioLink(conf);
                        }}
                      >
                        📋 Copier lien
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredConfs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl block mb-2">🫥</span>
                <p className="text-slate-400">Aucune conférence ne correspond à vos filtres.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-2xl">{getTypeIcon(selected.type)}</span>
                    <Badge variant={getStatusBadge(selected.status)}>{selected.status}</Badge>
                    <Badge variant={getPriorityBadge(selected.priority)}>{selected.priority}</Badge>
                  </div>
                  <span className="font-mono text-xs text-purple-400">{selected.id}</span>
                  <h3 className="font-bold">{selected.title}</h3>
                  {(() => {
                    const d = safeDate(selected.scheduledAt);
                    return (
                      <p className="text-sm text-slate-400 mt-1">
                        {d ? `${formatDateFR(d)} à ${formatTimeFR(d)}` : 'Date/heure non renseignée'}
                      </p>
                    );
                  })()}
                </div>

                {/* Contexte */}
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30 mb-4">
                  <p className="text-xs text-blue-400">🔗 {selected.linkedContext.type}</p>
                  <p className="font-medium text-sm">{selected.linkedContext.label}</p>
                  <p className="text-xs text-slate-400 mt-1">ID: {selected.linkedContext.id}</p>
                </div>

                {/* Onglets */}
                <div className="flex gap-1 mb-4 flex-wrap">
                  <Button size="sm" variant={safeViewTab === 'agenda' ? 'default' : 'secondary'} onClick={() => setViewTab('agenda')}>
                    📋 Agenda
                  </Button>
                  <Button size="sm" variant={safeViewTab === 'participants' ? 'default' : 'secondary'} onClick={() => setViewTab('participants')}>
                    👥 ({selected.participants.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={safeViewTab === 'summary' ? 'default' : 'secondary'}
                    onClick={() => selected.summary && setViewTab('summary')}
                    disabled={!selected.summary}
                    title={!selected.summary ? 'Compte-rendu non disponible' : undefined}
                  >
                    📝 CR
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {safeViewTab === 'agenda' && (
                    selected.agenda.map((item) => (
                      <div
                        key={item.order}
                        className={cn(
                          'p-2 rounded text-xs',
                          darkMode ? 'bg-slate-700/30' : 'bg-gray-100',
                          item.decisionRequired && 'border-l-2 border-l-amber-500'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">
                            {item.order}. {item.title}
                          </span>
                          <Badge
                            variant={
                              item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'info' : 'default'
                            }
                          >
                            {item.duration}min
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{item.type}</Badge>
                          {item.decisionRequired && <Badge variant="warning">Décision</Badge>}
                        </div>
                        {item.outcome && <p className="text-emerald-400 mt-1">→ {item.outcome}</p>}
                      </div>
                    ))
                  )}

                  {safeViewTab === 'participants' && (
                    selected.participants.map((p) => (
                      <div
                        key={p.employeeId}
                        className={cn(
                          'p-2 rounded text-xs flex items-center justify-between',
                          darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                        )}
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-slate-400">
                            {p.bureau} • {p.role}
                          </p>
                        </div>
                        <Badge variant={p.presence === 'confirme' ? 'success' : p.presence === 'decline' ? 'urgent' : 'default'}>
                          {p.presence}
                        </Badge>
                      </div>
                    ))
                  )}

                  {safeViewTab === 'summary' && selected.summary && (
                    <div className="space-y-3">
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-xs text-slate-400 mb-1">Généré par: {selected.summary.generatedBy}</p>
                        {selected.summary.validatedBy && (
                          <p className="text-xs text-emerald-400">✓ Validé par {selected.summary.validatedBy}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold mb-1">Points clés</p>
                        {selected.summary.keyPoints.map((kp, idx) => (
                          <p key={idx} className="text-xs text-slate-300">
                            • {kp}
                          </p>
                        ))}
                      </div>

                      {selected.summary.decisionsProposed.length > 0 && (
                        <div>
                          <p className="text-xs font-bold mb-1">Décisions</p>
                          {selected.summary.decisionsProposed.map((d) => (
                            <div key={d.id} className="text-xs p-2 rounded bg-slate-700/20 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <Badge
                                  variant={
                                    d.status === 'adopted' ? 'success' : d.status === 'rejected' ? 'urgent' : 'default'
                                  }
                                >
                                  {d.status}
                                </Badge>
                                <span className="text-[10px] text-slate-400">ID: {d.id}</span>
                              </div>
                              <p className="text-slate-200">{d.description}</p>
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
                    <>
                      <Button size="sm" variant="success" onClick={() => handleJoinConference(selected)}>
                        🔗 Rejoindre la conférence
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleCopyVisioLink(selected)}>
                        📋 Copier le lien visio
                      </Button>
                      {selected.visioLink && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            log({
                              module: 'conferences',
                              action: 'open_visio',
                              targetId: selected.id,
                              targetType: 'Conference',
                              details: 'Ouverture lien visio (sans rejoindre)',
                            });
                            openExternal(selected.visioLink);
                          }}
                        >
                          ↗️ Ouvrir dans un nouvel onglet
                        </Button>
                      )}
                    </>
                  )}

                  {selected.status === 'terminee' && !selected.summary && (
                    <Button size="sm" variant="info" onClick={() => handleGenerateSummary(selected)}>
                      🤖 Générer CR (IA)
                    </Button>
                  )}

                  {selected.summary && selected.summary.generatedBy === 'ia' && (
                    <Button size="sm" variant="success" onClick={() => handleValidateSummary(selected)}>
                      ✓ Valider le CR
                    </Button>
                  )}

                  {selected.summary && selected.summary.validatedBy && selected.decisionsExtracted.length === 0 && (
                    <Button size="sm" variant="default" onClick={() => handleExtractDecisions(selected)}>
                      📤 Extraire décisions
                    </Button>
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
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📹</span>
                <p className="text-slate-400">Sélectionnez une conférence</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fonctionnalités visio prévues */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🚀 Fonctionnalités visio prévues</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: '🎥',
              title: 'Réunions vidéo',
              desc: "Organisez des réunions vidéo directement depuis l'interface BMO.",
              bullets: ["HD jusqu'à 1080p", "Jusqu'à 50 participants", "Partage d'écran"],
            },
            {
              icon: '📅',
              title: 'Planification',
              desc: "Planifiez et synchronisez automatiquement avec le calendrier BMO.",
              bullets: ['Invitations automatiques', 'Rappels email/push', 'Récurrence configurable'],
            },
            {
              icon: '💬',
              title: 'Chat intégré',
              desc: 'Communiquez en temps réel pendant les réunions.',
              bullets: ['Messages texte', 'Partage de fichiers', 'Réactions emoji'],
            },
            {
              icon: '🎙️',
              title: 'Enregistrement',
              desc: 'Enregistrez les réunions pour audit, preuve et relecture.',
              bullets: ['Enregistrement cloud', 'Transcription automatique', 'Résumé IA'],
            },
            {
              icon: '🔗',
              title: 'Intégration projets',
              desc: 'Liez réunions, projets et dossiers pour traçabilité complète.',
              bullets: ['Lien avec projets', 'Comptes-rendus automatiques', 'Suivi des décisions'],
            },
            {
              icon: '🌐',
              title: 'Accès externe',
              desc: "Invitez des participants externes sans compte YESSALATE.",
              bullets: ["Lien d'invitation", "Salle d'attente", 'Accès sécurisé'],
            },
          ].map((f) => (
            <Card key={f.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{f.icon}</span>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">{f.desc}</p>
                <ul className="text-xs space-y-1 text-slate-500">
                  {f.bullets.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
