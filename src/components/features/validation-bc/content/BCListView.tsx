/**
 * Vue liste des Bons de Commande
 */

'use client';

import React from 'react';
import { ValidationBCDocumentsList } from './ValidationBCDocumentsList';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

interface BCListViewProps {
  subCategory?: string;
  onDocumentClick?: (doc: ValidationDocument) => void;
  onValidate?: (doc: ValidationDocument) => void;
  onReject?: (doc: ValidationDocument) => void;
}

export function BCListView({
  subCategory = 'all',
  onDocumentClick,
  onValidate,
  onReject,
}: BCListViewProps) {
  const filters: any = {
    type: 'bc',
  };

  // Appliquer les filtres de sous-catégorie
  if (subCategory === 'pending') {
    filters.status = 'pending';
  } else if (subCategory === 'validated') {
    filters.status = 'validated';
  } else if (subCategory === 'rejected') {
    filters.status = 'rejected';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Bons de Commande</h2>
          <p className="text-slate-400 text-sm">
            {subCategory === 'pending' && 'Documents en attente de validation'}
            {subCategory === 'validated' && 'Documents validés'}
            {subCategory === 'rejected' && 'Documents rejetés'}
            {subCategory === 'all' && 'Tous les bons de commande'}
          </p>
        </div>
      </div>

      <ValidationBCDocumentsList
        filters={filters}
        onDocumentClick={onDocumentClick}
        onValidate={onValidate}
        onReject={onReject}
        emptyMessage="Aucun bon de commande trouvé"
      />
    </div>
  );
}

