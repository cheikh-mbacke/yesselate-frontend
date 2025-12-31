import { create } from 'zustand';
import type {
  Task,
  Notification,
  Toast,
  LiveStats,
  AIMessage,
  ActionLog,
  ActionLogType,
  SubstitutionAction,
  BlockedDossier,
} from '@/lib/types/bmo.types';

// ============================================
// Store du module BMO (Maître d'Ouvrage)
// Gère l'état local du portail BMO
// ============================================

interface BMOState {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Panels rapides (tâches, rappels, notes, etc.)
  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
  
  // Modales
  showModal: string | null;
  modalData: unknown;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Recherche
  showSearch: boolean;
  searchQuery: string;
  setShowSearch: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  // Notifications
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  markNotificationAsRead: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  
  // Tâches
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  removeTask: (id: string) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  
  // Stats temps réel
  liveStats: LiveStats;
  updateLiveStats: (stats: Partial<LiveStats>) => void;
  
  // Assistant IA
  showAI: boolean;
  aiMessages: AIMessage[];
  aiInput: string;
  setShowAI: (show: boolean) => void;
  setAiInput: (input: string) => void;
  addAiMessage: (message: AIMessage) => void;
  
  // Auto-refresh
  isAutoRefresh: boolean;
  refreshInterval: number;
  lastUpdate: Date;
  setIsAutoRefresh: (value: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setLastUpdate: (date: Date) => void;
  
  // ============================================
  // NOUVEAUX ÉTATS - Journalisation & Modales
  // ============================================
  
  // Système de journalisation (logs)
  actionLogs: ActionLog[];
  addActionLog: (log: Omit<ActionLog, 'id' | 'timestamp'>) => void;
  getLogsByModule: (module: string) => ActionLog[];
  getLogsByUser: (userId: string) => ActionLog[];
  getLogsByDateRange: (start: Date, end: Date) => ActionLog[];
  clearOldLogs: (daysToKeep: number) => void;
  
  // Modal Substitution
  substitutionModalData: {
    isOpen: boolean;
    dossier: BlockedDossier | null;
    action: Partial<SubstitutionAction> | null;
  };
  openSubstitutionModal: (dossier: BlockedDossier) => void;
  closeSubstitutionModal: () => void;
  updateSubstitutionAction: (action: Partial<SubstitutionAction>) => void;
  
  // Modal Blocage (détails d'un blocage > 5 jours)
  blocageModalData: {
    isOpen: boolean;
    dossier: BlockedDossier | null;
  };
  openBlocageModal: (dossier: BlockedDossier) => void;
  closeBlocageModal: () => void;
  
  // Modal Détails Bureau
  bureauDetailsModalData: {
    isOpen: boolean;
    bureauCode: string | null;
  };
  openBureauDetailsModal: (bureauCode: string) => void;
  closeBureauDetailsModal: () => void;
}

// Données initiales
const initialTasks: Task[] = [
  { id: 't1', text: 'Valider BC urgents en attente', priority: 'high', due: "Aujourd'hui", done: false, bureau: 'BMO' },
  { id: 't2', text: 'Réunion équipe BMO - Bilan mensuel', priority: 'normal', due: '15:00', done: false, bureau: 'BMO' },
  { id: 't3', text: 'Préparer rapport délégations Q4', priority: 'normal', due: 'Demain', done: false, bureau: 'BMO' },
  { id: 't4', text: 'Signer contrat EIFFAGE', priority: 'high', due: 'Terminé', done: true, bureau: 'BJ' },
  { id: 't5', text: 'Réviser budget projet Diamniadio', priority: 'high', due: 'Urgent', done: false, bureau: 'BF' },
  { id: 't6', text: 'Contrôle qualité béton Lot 4', priority: 'high', due: 'Demain', done: false, bureau: 'BQC' },
];

const initialNotifications: Notification[] = [
  { id: 1, title: 'Dossier bloqué 7 jours', desc: 'PAY-2025-0041', unread: true, icon: '🚨', time: '5 min' },
  { id: 2, title: 'Nouvelle demande urgente', desc: 'DEM-2025-0156', unread: true, icon: '📋', time: '15 min' },
  { id: 3, title: 'BC validé', desc: 'BC-PRJ0018-2025-0048', unread: false, icon: '✅', time: '30 min' },
];

const initialLiveStats: LiveStats = {
  demandesEnCours: 14,
  validationsJour: 12,
  montantTraite: '45,250,000',
  alertesCritiques: 2,
  tauxValidation: 94.2,
  tempsReponse: '2.4h',
};

const initialAiMessages: AIMessage[] = [
  { type: 'bot', text: 'Bonjour ! Je suis votre assistant IA BMO. Comment puis-je vous aider ?' },
];

// Logs initiaux (exemples)
const initialActionLogs: ActionLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // Il y a 1h
    userId: 'USR-001',
    userName: 'A. DIALLO',
    userRole: 'Directeur Général',
    action: 'validation',
    module: 'validation-bc',
    targetId: 'BC-2025-0048',
    targetType: 'Bon de commande',
    targetLabel: 'BC Matériaux Diamniadio',
    details: 'Validation du BC pour un montant de 1,250,000 FCFA',
    bureau: 'BMO',
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // Il y a 2h
    userId: 'USR-001',
    userName: 'A. DIALLO',
    userRole: 'Directeur Général',
    action: 'substitution',
    module: 'substitution',
    targetId: 'PAY-2025-0039',
    targetType: 'Paiement',
    targetLabel: 'Substitution paiement EIFFAGE',
    details: 'Substitution pour absence du responsable F. DIOP',
    bureau: 'BF',
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 10800000).toISOString(), // Il y a 3h
    userId: 'USR-002',
    userName: 'M. SARR',
    userRole: 'Resp. Validation',
    action: 'delegation',
    module: 'delegations',
    targetId: 'DEL-001',
    targetType: 'Délégation',
    targetLabel: 'Extension délégation validation BC',
    details: 'Extension de la délégation jusqu\'au 31/03/2025',
    bureau: 'BMO',
  },
];

export const useBMOStore = create<BMOState>()((set, get) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Panels
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  // Modales
  showModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ showModal: modal, modalData: data }),
  closeModal: () => set({ showModal: null, modalData: null }),
  
  // Recherche
  showSearch: false,
  searchQuery: '',
  setShowSearch: (show) => set({ showSearch: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Notifications
  notifications: initialNotifications,
  showNotifications: false,
  setShowNotifications: (show) => set({ showNotifications: show }),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      ),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: Date.now() },
        ...state.notifications,
      ],
    })),
  
  // Tâches
  tasks: initialTasks,
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: `t${Date.now()}` }],
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  
  // Toasts
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove après 4 secondes
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  // Stats temps réel
  liveStats: initialLiveStats,
  updateLiveStats: (stats) =>
    set((state) => ({
      liveStats: { ...state.liveStats, ...stats },
    })),
  
  // Assistant IA
  showAI: false,
  aiMessages: initialAiMessages,
  aiInput: '',
  setShowAI: (show) => set({ showAI: show }),
  setAiInput: (input) => set({ aiInput: input }),
  addAiMessage: (message) =>
    set((state) => ({
      aiMessages: [...state.aiMessages, message],
    })),
  
  // Auto-refresh
  isAutoRefresh: true,
  refreshInterval: 30,
  lastUpdate: new Date(),
  setIsAutoRefresh: (value) => set({ isAutoRefresh: value }),
  setRefreshInterval: (interval) => set({ refreshInterval: interval }),
  setLastUpdate: (date) => set({ lastUpdate: date }),
  
  // ============================================
  // NOUVEAUX ÉTATS - Journalisation & Modales
  // ============================================
  
  // Système de journalisation
  actionLogs: initialActionLogs,
  
  addActionLog: (log) => {
    const newLog: ActionLog = {
      ...log,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      actionLogs: [newLog, ...state.actionLogs],
    }));
  },
  
  getLogsByModule: (module) => {
    return get().actionLogs.filter((log) => log.module === module);
  },
  
  getLogsByUser: (userId) => {
    return get().actionLogs.filter((log) => log.userId === userId);
  },
  
  getLogsByDateRange: (start, end) => {
    return get().actionLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  },
  
  clearOldLogs: (daysToKeep) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    set((state) => ({
      actionLogs: state.actionLogs.filter(
        (log) => new Date(log.timestamp) >= cutoffDate
      ),
    }));
  },
  
  // Modal Substitution
  substitutionModalData: {
    isOpen: false,
    dossier: null,
    action: null,
  },
  
  openSubstitutionModal: (dossier) => {
    set({
      substitutionModalData: {
        isOpen: true,
        dossier,
        action: {
          dossierRef: dossier.id,
          dossierType: dossier.type,
          dossierSubject: dossier.subject,
          dossierAmount: dossier.amount,
          dossierBureau: dossier.bureau,
          dossierResponsible: dossier.responsible,
          dossierReason: dossier.reason,
          actionType: 'instruire',
          traitant: '',
          traitantId: '',
          deadline: '',
          status: 'pending',
        },
      },
    });
  },
  
  closeSubstitutionModal: () => {
    set({
      substitutionModalData: {
        isOpen: false,
        dossier: null,
        action: null,
      },
    });
  },
  
  updateSubstitutionAction: (action) => {
    set((state) => ({
      substitutionModalData: {
        ...state.substitutionModalData,
        action: {
          ...state.substitutionModalData.action,
          ...action,
        },
      },
    }));
  },
  
  // Modal Blocage
  blocageModalData: {
    isOpen: false,
    dossier: null,
  },
  
  openBlocageModal: (dossier) => {
    set({
      blocageModalData: {
        isOpen: true,
        dossier,
      },
    });
  },
  
  closeBlocageModal: () => {
    set({
      blocageModalData: {
        isOpen: false,
        dossier: null,
      },
    });
  },
  
  // Modal Détails Bureau
  bureauDetailsModalData: {
    isOpen: false,
    bureauCode: null,
  },
  
  openBureauDetailsModal: (bureauCode) => {
    set({
      bureauDetailsModalData: {
        isOpen: true,
        bureauCode,
      },
    });
  },
  
  closeBureauDetailsModal: () => {
    set({
      bureauDetailsModalData: {
        isOpen: false,
        bureauCode: null,
      },
    });
  },
}));
