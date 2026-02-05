/**
 * Vue liste des Avenants
 */

'use client';

import React from 'react';
import { ValidationBCDocumentsList } from './ValidationBCDocumentsList';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

interface AvenantsListViewProps {
  subCategory?: string;
  onDocumentClick?: (doc: ValidationDocument) => void;
  onValidate?: (doc: ValidationDocument) => void;
  onReject?: (doc: ValidationDocument) => void;
}

export function AvenantsListView({
  subCategory = 'all',
  onDocumentClick,
  onValidate,
  onReject,
}: AvenantsListViewProps) {
  const filters: any = {
    type: 'avenant',
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
          <h2 className="text-2xl font-bold text-slate-200">Avenants</h2>
          <p className="text-slate-400 text-sm">
            {subCategory === 'pending' && 'Avenants en attente de validation'}
            {subCategory === 'validated' && 'Avenants validés'}
            {subCategory === 'rejected' && 'Avenants rejetés'}
            {subCategory === 'all' && 'Tous les avenants'}
          </p>
        </div>
      </div>

      <ValidationBCDocumentsList
        filters={filters}
        onDocumentClick={onDocumentClick}
        onValidate={onValidate}
        onReject={onReject}
        emptyMessage="Aucun avenant trouvé"
      />
    </div>
  );
}

