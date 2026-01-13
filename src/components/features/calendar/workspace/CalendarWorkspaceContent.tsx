'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCalendarWorkspaceStore, type CalendarUIState, type CalendarTab } from '@/lib/stores/calendarWorkspaceStore';
import { CalendarInboxView } from './views/CalendarInboxView';
import { CalendarMonthView } from './views/CalendarMonthView';
import { CalendarWizardView } from './views/CalendarWizardView';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  CalendarIcon, Inbox, Clock, Plus, Calendar, 
  Edit2, XCircle, UserPlus, FileText, Download,
  CalendarDays, GanttChart, LayoutGrid, Eye,
  AlertTriangle, Users, MapPin, Building2,
  CheckCircle2, RefreshCw, ExternalLink, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CalendarWorkspaceContent
 * ==========================
 * 
 * Composant central qui route vers la bonne vue selon le type d'onglet.
 * Gère aussi les modals d'actions atomiques de manière centralisée.
 * 
 * Architecture sophistiquée :
 * - Modals = "agir" (transactions atomiques)
 * - Onglets/Fenêtres = "travailler" (analyse, navigation, décision)
 * 
 * Vues disponibles :
 * - inbox: Files de travail (Aujourd'hui, Semaine, Retards SLA, Conflits)
 * - calendar: Vue mensuelle interactive
 * - viewer: Détail d'un événement
 * - wizard: Création/modification guidée
 */

// ============================================
// TYPES
// ============================================
type ModalType = 'edit' | 'reschedule' | 'cancel' | 'add_participant' | 'export' | null;
type QueueType = 'today' | 'week' | 'month' | 'overdue' | 'conflicts' | 'completed' | 'all';

// ============================================
// COMPONENT
// ============================================

export function CalendarWorkspaceContent() {
  const { tabs, activeTabId, openTab, closeTab, updateTab, setTabUI, getTabUI } = useCalendarWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Modal centralisée
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalContext, setModalContext] = useState<{ eventId?: string; eventTitle?: string }>({});

  // Ouvrir une modal avec contexte
  const openModal = useCallback((modal: ModalType, context?: typeof modalContext) => {
    setActiveModal(modal);
    if (context) setModalContext(context);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalContext({});
  }, []);

  // ================================
  // VUE PAR DÉFAUT (pas d'onglet actif)
  // ================================
  if (!activeTab) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70 flex flex-col items-center justify-center text-center min-h-[400px]">
        <CalendarIcon className="w-16 h-16 text-blue-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          Gestion du Calendrier
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Organisez les événements, réunions, visites de sites et dates limites. 
          Détectez les conflits et gérez les SLA en temps réel.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:today', 
              type: 'inbox', 
              title: "Aujourd'hui", 
              icon: '📅', 
              data: { queue: 'today' } 
            })}
          >
            <CalendarDays className="w-4 h-4 text-blue-500" /> Aujourd&apos;hui
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:week', 
              type: 'inbox', 
              title: 'Cette semaine', 
              icon: '📆', 
              data: { queue: 'week' } 
            })}
          >
            <Calendar className="w-4 h-4 text-emerald-500" /> Cette semaine
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:overdue', 
              type: 'inbox', 
              title: 'En retard SLA', 
              icon: '⏰', 
              data: { queue: 'overdue' } 
            })}
          >
            <Clock className="w-4 h-4 text-amber-500" /> En retard SLA
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:conflicts', 
              type: 'inbox', 
              title: 'Conflits', 
              icon: '⚠️', 
              data: { queue: 'conflicts' } 
            })}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Conflits
          </FluentButton>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <FluentButton
            variant="primary"
            onClick={() => {
              openTab({
                id: `wizard:create:${Date.now()}`,
                type: 'wizard',
                title: 'Nouvel événement',
                icon: '➕',
                data: { action: 'create' },
              });
            }}
          >
            <Plus className="w-4 h-4" /> Nouvel événement
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'calendar:month', 
              type: 'calendar', 
              title: 'Vue Mensuelle', 
              icon: '📅', 
              data: { view: 'month' } 
            })}
          >
            <LayoutGrid className="w-4 h-4" /> Vue Mensuelle
          </FluentButton>
        </div>
        
        <p className="text-xs text-slate-400 mt-8">
          Astuce: Utilisez <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+1</kbd> à <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+4</kbd> pour ouvrir les vues rapides.
        </p>
      </div>
    );
  }

  // ================================
  // ROUTING PAR TYPE D'ONGLET
  // ================================

  // Inbox (file de travail)
  if (activeTab.type === 'inbox') {
    const queue = (activeTab.data?.queue as QueueType) || 'all';
    return <CalendarInboxView tabId={activeTab.id} queue={queue} />;
  }

  // Calendar (vue mensuelle classique)
  if (activeTab.type === 'calendar') {
    return <CalendarMonthView tabId={activeTab.id} />;
  }

  // Viewer (visualisation d'un événement unique)
  if (activeTab.type === 'viewer') {
    const eventId = activeTab.data?.eventId || activeTab.id.replace('event:', '');

    const handleOpenModal = (modal: ModalType) => {
      openModal(modal, {
        eventId,
        eventTitle: activeTab.title,
      });
    };

    return (
      <>
        <CalendarEventViewer
          tabId={activeTab.id}
          eventId={eventId}
          onOpenModal={handleOpenModal}
        />

        {/* MODALS CENTRALISÉES */}
        <FluentModal
          open={activeModal === 'edit'}
          title="Modifier l'événement"
          onClose={closeModal}
        >
          <EditEventForm
            eventId={modalContext.eventId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        <FluentModal
          open={activeModal === 'reschedule'}
          title="Déplacer l'événement"
          onClose={closeModal}
        >
          <RescheduleEventForm
            eventId={modalContext.eventId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        <FluentModal
          open={activeModal === 'cancel'}
          title="Annuler l'événement"
          onClose={closeModal}
        >
          <CancelEventForm
            eventId={modalContext.eventId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        <FluentModal
          open={activeModal === 'add_participant'}
          title="Ajouter un participant"
          onClose={closeModal}
        >
          <AddParticipantForm
            eventId={modalContext.eventId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        <FluentModal
          open={activeModal === 'export'}
          title="Exporter l'événement"
          onClose={closeModal}
        >
          <ExportEventForm
            eventId={modalContext.eventId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>
      </>
    );
  }

  // Wizard (création/modification)
  if (activeTab.type === 'wizard') {
    const action = (activeTab.data?.action as 'create' | 'edit') || 'create';
    const eventId = activeTab.data?.eventId;
    const prefillDate = activeTab.data?.prefillDate;

    return (
      <CalendarWizardView
        tabId={activeTab.id}
        action={action}
        eventId={eventId}
        prefillDate={prefillDate}
      />
    );
  }

  // Scenario (planification automatique)
  if (activeTab.type === 'scenario') {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center p-8">
          <GanttChart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            Scénario de planification
          </h3>
          <p className="text-slate-500 mb-4">
            Fonctionnalité en cours de développement
          </p>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => closeTab(activeTab.id)}
          >
            Fermer
          </FluentButton>
        </div>
      </div>
    );
  }

  // Report
  if (activeTab.type === 'report') {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center p-8">
          <FileText className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            Rapport
          </h3>
          <p className="text-slate-500 mb-4">
            ID: {activeTab.data?.reportId ?? 'inconnu'}
          </p>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => closeTab(activeTab.id)}
          >
            Fermer
          </FluentButton>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
      <div className="text-center p-8">
        <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          Vue non reconnue
        </h3>
        <p className="text-slate-500 mb-4">
          Type: {activeTab.type}
        </p>
        <FluentButton
          size="sm"
          variant="secondary"
          onClick={() => closeTab(activeTab.id)}
        >
          Fermer
        </FluentButton>
      </div>
    </div>
  );
}

// ============================================
// EVENT VIEWER (vue détaillée d'un événement)
// ============================================
interface CalendarEventViewerProps {
  tabId: string;
  eventId: string;
  onOpenModal: (modal: ModalType) => void;
}

function CalendarEventViewer({ tabId, eventId, onOpenModal }: CalendarEventViewerProps) {
  const { closeTab, openTab } = useCalendarWorkspaceStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const { calendarEvents } = await import('@/lib/data/calendar');
        const found = calendarEvents.find((e: any) => e.id === eventId);
        if (found) {
          setEvent({
            ...found,
            start: new Date(found.start),
            end: new Date(found.end),
          });
        } else {
          setError('Événement non trouvé');
        }
      } catch (err) {
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-slate-500">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            {error || 'Événement non trouvé'}
          </h3>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => closeTab(tabId)}
          >
            Fermer
          </FluentButton>
        </div>
      </div>
    );
  }

  const categoryColor = {
    meeting: 'bg-blue-500',
    site_visit: 'bg-emerald-500',
    deadline: 'bg-amber-500',
    validation: 'bg-purple-500',
    payment: 'bg-green-500',
    absence: 'bg-slate-400',
  }[event.category?.toLowerCase()] || 'bg-indigo-500';

  const statusBadge = {
    completed: { label: 'Terminé', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    cancelled: { label: 'Annulé', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500' },
    in_progress: { label: 'En cours', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700' },
  }[event.status?.toLowerCase()] || { label: 'Planifié', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700' };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900/50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl", categoryColor)}>
            📅
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {event.title}
              </h1>
              {event.hasConflict && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Conflit
                </span>
              )}
              {event.slaStatus === 'overdue' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Retard SLA
                </span>
              )}
            </div>
            <p className="text-slate-500">
              {event.description || 'Aucune description'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal('edit')}>
              <Edit2 className="w-4 h-4" />
            </FluentButton>
            <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal('export')}>
              <Download className="w-4 h-4" />
            </FluentButton>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Date & Heure</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                  {event.start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>
                  {event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                  {event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Lieu & Bureau</h3>
            <div className="space-y-2">
              {event.location && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.bureau && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span>{event.bureau}</span>
                </div>
              )}
              {!event.location && !event.bureau && (
                <span className="text-slate-400">Non spécifié</span>
              )}
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusBadge.bg, statusBadge.text)}>
                {statusBadge.label}
              </span>
              {event.priority && event.priority !== 'normal' && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700">
                  Priorité: {event.priority}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal('reschedule')}>
                <Calendar className="w-4 h-4 mr-1" />
                Déplacer
              </FluentButton>
              <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal('add_participant')}>
                <UserPlus className="w-4 h-4 mr-1" />
                Participant
              </FluentButton>
              <FluentButton size="sm" variant="warning" onClick={() => onOpenModal('cancel')}>
                <XCircle className="w-4 h-4 mr-1" />
                Annuler
              </FluentButton>
            </div>
          </div>
        </div>

        {/* Participants */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({event.attendees.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((a: any, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm">
                  {a.name}
                  {a.role === 'organizer' && <span className="ml-1 text-xs text-blue-500">(org)</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {event.links && event.links.length > 0 && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Éléments liés ({event.links.length})
            </h3>
            <div className="space-y-2">
              {event.links.map((link: any, i: number) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  onClick={() => {
                    if (link.type === 'demande') {
                      openTab({
                        id: `demande:${link.ref}`,
                        type: 'viewer',
                        title: link.title || link.ref,
                        icon: '📝',
                        data: { demandeId: link.ref },
                      });
                    }
                  }}
                >
                  <span className="text-lg">
                    {link.type === 'demande' ? '📝' : link.type === 'delegation' ? '🔑' : '📄'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{link.title || link.ref}</div>
                    <div className="text-xs text-slate-500">{link.type} • {link.ref}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// FORMULAIRES MODALS
// ============================================

interface ModalFormProps {
  eventId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function EditEventForm({ eventId, onSuccess, onCancel }: ModalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    // TODO: Charger les données de l'événement existant
  }, [eventId]);

  const handleSubmit = async () => {
    if (!eventId || !title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } catch (e) {
      setError('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-300">
          {error}
        </div>
      )}
      <div>
        <label className="text-sm text-slate-500">Titre *</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'événement..."
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Description</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleSubmit} disabled={loading || !title.trim()}>
          <Edit2 className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Modification...' : 'Modifier'}
        </FluentButton>
      </div>
    </div>
  );
}

function RescheduleEventForm({ eventId, onSuccess, onCancel }: ModalFormProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!eventId || !newDate) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-500">Nouvelle date *</label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Nouvelle heure *</label>
          <input
            type="time"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-500">Motif (optionnel)</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison du déplacement..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="warning" onClick={handleSubmit} disabled={loading || !newDate}>
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Déplacement...' : 'Déplacer'}
        </FluentButton>
      </div>
    </div>
  );
}

function CancelEventForm({ eventId, onSuccess, onCancel }: ModalFormProps) {
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!eventId || !reason.trim() || !confirm) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
        <p className="text-sm text-rose-800 dark:text-rose-300">
          ⚠️ L&apos;événement sera annulé. Tous les participants seront notifiés.
        </p>
      </div>
      <div>
        <label className="text-sm text-slate-500">Motif d&apos;annulation *</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison de l'annulation..."
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
          className="rounded"
        />
        Je confirme vouloir annuler cet événement
      </label>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton 
          size="sm" 
          variant="destructive" 
          onClick={handleSubmit} 
          disabled={loading || !reason.trim() || !confirm}
        >
          <XCircle className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Annulation...' : 'Annuler l\'événement'}
        </FluentButton>
      </div>
    </div>
  );
}

function AddParticipantForm({ eventId, onSuccess, onCancel }: ModalFormProps) {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('participant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!eventId || !userName.trim()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-500">Personne *</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Nom de la personne..."
        />
      </div>
      <div>
        <label className="text-sm text-slate-500">Rôle</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="participant">Participant</option>
          <option value="organizer">Organisateur</option>
          <option value="required">Requis</option>
          <option value="optional">Optionnel</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleSubmit} disabled={loading || !userName.trim()}>
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Ajout...' : 'Ajouter'}
        </FluentButton>
      </div>
    </div>
  );
}

function ExportEventForm({ eventId, onSuccess, onCancel }: ModalFormProps) {
  const [format, setFormat] = useState<'ical' | 'pdf' | 'json'>('ical');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      window.open(`/api/calendar/events/${encodeURIComponent(eventId)}/export?format=${format}`, '_blank');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Télécharger les détails de cet événement.
      </p>
      <div>
        <label className="text-sm text-slate-500">Format</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={format}
          onChange={(e) => setFormat(e.target.value as typeof format)}
        >
          <option value="ical">iCal (Outlook, Google Calendar)</option>
          <option value="pdf">PDF (document imprimable)</option>
          <option value="json">JSON (données structurées)</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleExport} disabled={loading}>
          <Download className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Export...' : 'Télécharger'}
        </FluentButton>
      </div>
    </div>
  );
}
