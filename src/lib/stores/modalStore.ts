'use client';
import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

export type ModalType = 
  | 'detail'
  | 'create'
  | 'edit'
  | 'delete'
  | 'confirm'
  | 'export'
  | 'stats'
  | 'help'
  | 'custom';

export interface ModalState {
  id: string;
  type: ModalType;
  isOpen: boolean;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface ModalStoreState {
  modals: Map<string, ModalState>;
  openModal: (id: string, type: ModalType, data?: Record<string, unknown>, metadata?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<ModalState>) => void;
  getModal: (id: string) => ModalState | undefined;
  isModalOpen: (id: string) => boolean;
}

// ============================================
// STORE
// ============================================

export const useModalStore = create<ModalStoreState>((set, get) => ({
  modals: new Map(),

  openModal: (id, type, data, metadata) => {
    set((state) => {
      const newModals = new Map(state.modals);
      newModals.set(id, {
        id,
        type,
        isOpen: true,
        data,
        metadata,
      });
      return { modals: newModals };
    });
  },

  closeModal: (id) => {
    set((state) => {
      const newModals = new Map(state.modals);
      newModals.delete(id);
      return { modals: newModals };
    });
  },

  closeAllModals: () => {
    set({ modals: new Map() });
  },

  updateModal: (id, updates) => {
    set((state) => {
      const modal = state.modals.get(id);
      if (!modal) return state;

      const newModals = new Map(state.modals);
      newModals.set(id, {
        ...modal,
        ...updates,
      });
      return { modals: newModals };
    });
  },

  getModal: (id) => {
    return get().modals.get(id);
  },

  isModalOpen: (id) => {
    return get().modals.get(id)?.isOpen ?? false;
  },
}));

// ============================================
// HELPERS
// ============================================

/**
 * Hook pour gérer une modal spécifique
 */
export function useModal(id: string) {
  const { openModal, closeModal, getModal, isModalOpen, updateModal } = useModalStore();

  return {
    isOpen: isModalOpen(id),
    data: getModal(id)?.data,
    metadata: getModal(id)?.metadata,
    open: (type: ModalType, data?: Record<string, unknown>, metadata?: Record<string, unknown>) => 
      openModal(id, type, data, metadata),
    close: () => closeModal(id),
    update: (updates: Partial<ModalState>) => updateModal(id, updates),
  };
}

