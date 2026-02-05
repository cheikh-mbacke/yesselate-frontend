// ============================================
// Hook pour gérer automatiquement les modales
// avec synchronisation entre pages
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores';

export interface ModalState {
  isOpen: boolean;
  data?: any;
  context?: Record<string, any>;
}

/**
 * Hook pour gérer automatiquement une modale avec synchronisation URL
 */
export function useModalManager(
  modalId: string,
  options?: {
    syncWithURL?: boolean; // Synchroniser l'état avec les paramètres URL
    persistState?: boolean; // Persister l'état dans le store
  }
) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
  });

  const openModal = useCallback((data?: any, context?: Record<string, any>) => {
    setModalState({
      isOpen: true,
      data,
      context,
    });

    // Synchroniser avec l'URL si activé
    if (options?.syncWithURL) {
      const params = new URLSearchParams();
      params.set('modal', modalId);
      if (data?.id) params.set('id', String(data.id));
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          params.set(key, String(value));
        });
      }
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [modalId, router, options?.syncWithURL]);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      data: undefined,
      context: undefined,
    });

    // Nettoyer l'URL si synchronisé
    if (options?.syncWithURL) {
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [router, options?.syncWithURL]);

  const updateModalData = useCallback((data: any) => {
    setModalState(prev => ({
      ...prev,
      data: { ...prev.data, ...data },
    }));
  }, []);

  return {
    isOpen: modalState.isOpen,
    data: modalState.data,
    context: modalState.context,
    openModal,
    closeModal,
    updateModalData,
  };
}

/**
 * Hook pour gérer plusieurs modales en même temps
 */
export function useMultipleModals(modalIds: string[]) {
  const modals = modalIds.reduce((acc, id) => {
    acc[id] = useModalManager(id, { syncWithURL: true });
    return acc;
  }, {} as Record<string, ReturnType<typeof useModalManager>>);

  const closeAllModals = useCallback(() => {
    Object.values(modals).forEach(modal => modal.closeModal());
  }, [modals]);

  const openModal = useCallback((id: string, data?: any, context?: Record<string, any>) => {
    // Fermer toutes les autres modales
    closeAllModals();
    // Ouvrir la modale demandée
    modals[id]?.openModal(data, context);
  }, [modals, closeAllModals]);

  return {
    modals,
    openModal,
    closeAllModals,
  };
}

