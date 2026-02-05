/**
 * Page : Par type > Bons de Commande
 */

'use client';

import React, { useState } from 'react';
import { useValidationData, useValidationFilters } from '../../hooks';
import { DocumentCard, ValidationModal, RejectModal, DocumentDetailsModal } from '../../components';
import { validerDocument, rejeterDocument } from '../../api/validationApi';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import type { DocumentValidation } from '../../types/validationTypes';

export function BonsCommandePage() {
  const { filtres } = useValidationFilters();
  const { data: documents, isLoading, error } = useValidationData({
    ...filtres,
    types: ['BC'],
  });

  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<DocumentValidation | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleValidate = (id: string) => {
    const doc = documents?.find((d) => d.id === id);
    if (doc) {
      setSelectedDocument(doc);
      setValidationModalOpen(true);
    }
  };

  const handleReject = (id: string) => {
    const doc = documents?.find((d) => d.id === id);
    if (doc) {
      setSelectedDocument(doc);
      setRejectModalOpen(true);
    }
  };

  const handleConfirmValidation = async (comment?: string) => {
    if (!selectedDocument) return;
    await validerDocument(selectedDocument.id, comment);
    setValidationModalOpen(false);
    setSelectedDocument(null);
    // Rafraîchir les données
    queryClient.invalidateQueries({ queryKey: ['validation-bc-data'] });
    queryClient.invalidateQueries({ queryKey: ['validation-bc-stats'] });
  };

  const handleConfirmReject = async (reason: string, comment?: string) => {
    if (!selectedDocument) return;
    await rejeterDocument(selectedDocument.id, reason);
    setRejectModalOpen(false);
    setSelectedDocument(null);
    // Rafraîchir les données
    queryClient.invalidateQueries({ queryKey: ['validation-bc-data'] });
    queryClient.invalidateQueries({ queryKey: ['validation-bc-stats'] });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des bons de commande...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des bons de commande</div>
      </div>
    );
  }

  const handleView = (id: string) => {
    const doc = documents?.find((d) => d.id === id);
    if (doc) {
      setSelectedDocument(doc);
      setDetailsModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-200">Bons de Commande</h2>
        </div>
        <p className="text-sm text-slate-400">
          Liste des bons de commande en attente de validation ({documents?.length || 0})
        </p>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onValidate={handleValidate}
              onReject={handleReject}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucun bon de commande trouvé</div>
        </div>
      )}

      {/* Modals */}
      {selectedDocument && (
        <>
          <DocumentDetailsModal
            open={detailsModalOpen}
            document={selectedDocument}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedDocument(null);
            }}
            onValidate={() => {
              setDetailsModalOpen(false);
              setValidationModalOpen(true);
            }}
            onReject={() => {
              setDetailsModalOpen(false);
              setRejectModalOpen(true);
            }}
          />
          <ValidationModal
            open={validationModalOpen}
            document={selectedDocument}
            onClose={() => {
              setValidationModalOpen(false);
              setSelectedDocument(null);
            }}
            onConfirm={handleConfirmValidation}
          />
          <RejectModal
            open={rejectModalOpen}
            document={selectedDocument}
            onClose={() => {
              setRejectModalOpen(false);
              setSelectedDocument(null);
            }}
            onConfirm={handleConfirmReject}
          />
        </>
      )}
    </div>
  );
}

