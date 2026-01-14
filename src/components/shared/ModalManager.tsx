'use client';
import React, { useEffect } from 'react';
import { useModalStore } from '@/lib/stores/modalStore';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * ModalManager - Gestionnaire global pour toutes les modals
 * 
 * Ce composant doit être ajouté à la racine de l'application (layout.tsx)
 * pour gérer toutes les modals de manière centralisée.
 * 
 * @example
 * // Dans app/layout.tsx
 * <ModalManager />
 */
export function ModalManager() {
  const { modals, closeModal, closeAllModals } = useModalStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer toutes les modals avec ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.size > 0) {
        closeAllModals();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modals.size, closeAllModals]);

  // Lock body scroll quand modals ouvertes
  useEffect(() => {
    if (modals.size > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [modals.size]);

  // Toujours rendre quelque chose pour éviter les problèmes de hooks
  // Utiliser un fragment vide si pas encore monté ou pas de container
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  const container = document.body;
  if (!container) {
    return null;
  }

  // Rendre toutes les modals ouvertes
  const openModals = Array.from(modals.values()).filter((modal) => modal.isOpen);
  
  if (openModals.length === 0) {
    return null;
  }

  return createPortal(
    <>
      {openModals.map((modal) => (
        <ModalBackdrop
          key={modal.id}
          onClose={() => closeModal(modal.id)}
        />
      ))}
    </>,
    container
  );
}

/**
 * Backdrop pour les modals
 */
function ModalBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9998] bg-slate-900/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

/**
 * Composant wrapper pour créer facilement une modal
 */
interface ModalWrapperProps {
  id: string;
  type?: 'detail' | 'create' | 'edit' | 'delete' | 'confirm' | 'export' | 'stats' | 'help' | 'custom';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'right' | 'left';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function ModalWrapper({
  id,
  type = 'custom',
  children,
  size = 'lg',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  className,
}: ModalWrapperProps) {
  const { isModalOpen, closeModal } = useModalStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOpen = isModalOpen(id);

  if (!mounted || !isOpen) return null;

  const container = typeof window !== 'undefined' ? document.body : null;
  if (!container) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const positionClasses = {
    center: 'items-center justify-center',
    right: 'items-center justify-end',
    left: 'items-center justify-start',
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex ${positionClasses[position]} p-4`}
      onClick={closeOnBackdrop ? () => closeModal(id) : undefined}
    >
      <div
        className={`
          relative w-full ${sizeClasses[size]} 
          bg-slate-800 rounded-xl border border-slate-700 
          shadow-2xl animate-in zoom-in-95 fade-in
          ${className || ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={() => closeModal(id)}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {children}
      </div>
    </div>,
    container
  );
}

