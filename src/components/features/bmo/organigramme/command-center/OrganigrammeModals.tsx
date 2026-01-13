/**
 * Modals pour Organigramme
 * Gestion centralisée des modals
 */

'use client';

import React from 'react';
import { useOrganigrammeCommandCenterStore } from '@/lib/stores/organigrammeCommandCenterStore';

export const OrganigrammeModals = React.memo(function OrganigrammeModals() {
  const { modal, closeModal } = useOrganigrammeCommandCenterStore();

  // Placeholder pour les modals - à implémenter selon les besoins
  if (!modal.isOpen) return null;

  return null; // Modals à implémenter
});

