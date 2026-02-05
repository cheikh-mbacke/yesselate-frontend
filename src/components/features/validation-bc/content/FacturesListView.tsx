/**
 * Vue liste des Factures
 */

'use client';

import React from 'react';
import { ValidationBCDocumentsList } from './ValidationBCDocumentsList';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

interface FacturesListViewProps {
  subCategory?: string;
  onDocumentClick?: (doc: ValidationDocument) => void;
  onValidate?: (doc: ValidationDocument) => void;
  onReject?: (doc: ValidationDocument) => void;
}

export function FacturesListView({
  subCategory = 'all',
  onDocumentClick,
  onValidate,
  onReject,
}: FacturesListViewProps) {
  const filters: any = {
    type: 'facture',
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
          <h2 className="text-2xl font-bold text-slate-200">Factures</h2>
          <p className="text-slate-400 text-sm">
            {subCategory === 'pending' && 'Factures en attente de validation'}
            {subCategory === 'validated' && 'Factures validées'}
            {subCategory === 'rejected' && 'Factures rejetées'}
            {subCategory === 'all' && 'Toutes les factures'}
          </p>
        </div>
      </div>

      <ValidationBCDocumentsList
        filters={filters}
        onDocumentClick={onDocumentClick}
        onValidate={onValidate}
        onReject={onReject}
        emptyMessage="Aucune facture trouvée"
      />
    </div>
  );
}

