'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePaymentToast } from './PaymentToast';
import { X, Download, FileText, FileJson, Shield, Loader2, CheckCircle2 } from 'lucide-react';

// ================================
// Types
// ================================
type ExportFormat = 'csv' | 'json' | 'evidence';
type ExportQueue = 'all' | 'pending' | '7days' | 'late' | 'critical' | 'validated' | 'blocked';

// ================================
// Component
// ================================
export function PaymentExportModal({
  open,
  onClose,
  selectedPaymentId,
}: {
  open: boolean;
  onClose: () => void;
  selectedPaymentId?: string | null;
}) {
  const toast = usePaymentToast();
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [queue, setQueue] = useState<ExportQueue>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      let url = `/api/payments/export?format=${format}&queue=${queue}`;
      
      if (format === 'evidence' && selectedPaymentId) {
        url += `&paymentId=${selectedPaymentId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json' || format === 'evidence') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `paiements_${format}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      } else {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `paiements_${queue}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      }

      setExportSuccess(true);
      setTimeout(() => {
        toast.success('Export réussi', `Fichier ${format.toUpperCase()} téléchargé`);
        setTimeout(onClose, 1000);
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur d\'export', 'Impossible de générer le fichier');
    } finally {
      setIsExporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Exporter les paiements</h2>
              <p className="text-sm text-slate-500">
                {selectedPaymentId ? 'Evidence Pack' : 'Export multi-format'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!selectedPaymentId && (
            <>
              {/* Queue Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sélection des paiements
                </label>
                <select
                  value={queue}
                  onChange={(e) => setQueue(e.target.value as ExportQueue)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">Tous les paiements</option>
                  <option value="pending">En attente</option>
                  <option value="7days">Échéances 7 jours</option>
                  <option value="late">En retard</option>
                  <option value="critical">Critiques (≥5M)</option>
                  <option value="validated">Validés</option>
                  <option value="blocked">Bloqués</option>
                </select>
              </div>
            </>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Format d'export
            </label>
            <div className="space-y-2">
              {/* CSV */}
              <button
                type="button"
                onClick={() => setFormat('csv')}
                disabled={!!selectedPaymentId}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all',
                  format === 'csv'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
                  selectedPaymentId && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-start gap-3">
                  <FileText className={cn(
                    'w-5 h-5 mt-0.5',
                    format === 'csv' ? 'text-emerald-600' : 'text-slate-400'
                  )} />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">CSV (Excel)</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Fichier compatible Excel, Google Sheets
                    </p>
                  </div>
                </div>
              </button>

              {/* JSON */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                disabled={!!selectedPaymentId}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all',
                  format === 'json'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
                  selectedPaymentId && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-start gap-3">
                  <FileJson className={cn(
                    'w-5 h-5 mt-0.5',
                    format === 'json' ? 'text-emerald-600' : 'text-slate-400'
                  )} />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">JSON (Audit-grade)</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Format structuré avec métadonnées et traçabilité
                    </p>
                  </div>
                </div>
              </button>

              {/* Evidence Pack */}
              <button
                type="button"
                onClick={() => setFormat('evidence')}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all',
                  format === 'evidence'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <div className="flex items-start gap-3">
                  <Shield className={cn(
                    'w-5 h-5 mt-0.5',
                    format === 'evidence' ? 'text-purple-600' : 'text-slate-400'
                  )} />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Evidence Pack</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Preuve complète avec hash canonique et workflow RACI
                    </p>
                    {selectedPaymentId && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        Pour le paiement sélectionné
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {format === 'csv' && 'Le fichier CSV contient toutes les colonnes pour analyse Excel.'}
              {format === 'json' && 'Le format JSON inclut les métadonnées d\'audit et la signature RACI.'}
              {format === 'evidence' && 'L\'Evidence Pack contient le payload canonique, le hash SHA-256 et la chaîne de traçabilité.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || exportSuccess}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors',
              exportSuccess
                ? 'bg-emerald-500'
                : 'bg-emerald-600 hover:bg-emerald-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Export en cours...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Exporté !
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Télécharger
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

