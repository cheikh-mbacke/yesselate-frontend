'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePaymentToast } from './PaymentToast';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Shield,
  Building2,
  User,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Lock,
  Unlock,
  Hash,
  ExternalLink,
  Download,
} from 'lucide-react';

// ================================
// Types
// ================================
type WorkflowStep = 'overview' | 'documents' | 'bf_validation' | 'dg_authorization' | 'confirmation';

interface WorkflowState {
  currentStep: WorkflowStep;
  bfValidation: {
    completed: boolean;
    by?: string;
    at?: string;
    hash?: string;
    comment?: string;
  };
  dgAuthorization: {
    completed: boolean;
    by?: string;
    at?: string;
    hash?: string;
    comment?: string;
  };
  documentsVerified: boolean;
  blockReason?: string;
}

interface PaymentForWorkflow {
  id: string;
  type: string;
  ref: string;
  beneficiary: string;
  amount: number;
  dueDate: string;
  daysToDue: number;
  project: string;
  bureau: string;
  status: string;
  riskScore: number;
  riskLabel: 'low' | 'medium' | 'high' | 'critical';
  requiresDoubleValidation: boolean;
  matchedFacture?: {
    id: string;
    fournisseur: string;
    montantTTC: number;
  } | null;
  matchQuality: 'none' | 'weak' | 'strong';
}

// ================================
// Helper Components
// ================================
function StepIndicator({ 
  steps, 
  currentStep, 
  completedSteps 
}: { 
  steps: { id: WorkflowStep; label: string; icon: React.ReactNode }[];
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isPast = idx < currentIndex;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span className={cn(
                'text-sm font-medium hidden sm:block',
                isCurrent ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'
              )}>
                {step.label}
              </span>
            </div>
            
            {idx < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2 rounded',
                isPast || isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RiskBadge({ label, score }: { label: string; score: number }) {
  const colors = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium', colors[label as keyof typeof colors] || colors.medium)}>
      <AlertTriangle className="w-3 h-3" />
      Risque {score}
    </span>
  );
}

// ================================
// Step Components
// ================================
function OverviewStep({ 
  payment, 
  onNext 
}: { 
  payment: PaymentForWorkflow;
  onNext: () => void;
}) {
  const formatFCFA = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
  
  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-mono text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
              {payment.id}
            </span>
            <h3 className="font-semibold text-lg mt-2">{payment.beneficiary}</h3>
            <p className="text-sm text-slate-500">{payment.type} • {payment.ref}</p>
          </div>
          <RiskBadge label={payment.riskLabel} score={payment.riskScore} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Montant</span>
            <p className={cn(
              'font-mono font-bold',
              payment.requiresDoubleValidation ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'
            )}>
              {formatFCFA(payment.amount)}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Échéance</span>
            <p className={cn(
              'font-medium',
              payment.daysToDue < 0 ? 'text-red-600' : payment.daysToDue <= 3 ? 'text-amber-600' : ''
            )}>
              {payment.dueDate}
              {payment.daysToDue < 0 && <span className="ml-2 text-xs text-red-500">J+{Math.abs(payment.daysToDue)}</span>}
              {payment.daysToDue >= 0 && payment.daysToDue <= 3 && <span className="ml-2 text-xs text-amber-500">J-{payment.daysToDue}</span>}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Projet</span>
            <p className="font-medium">{payment.project}</p>
          </div>
          <div>
            <span className="text-slate-500">Bureau</span>
            <p className="font-medium">{payment.bureau}</p>
          </div>
        </div>
      </div>
      
      {/* Double Validation Notice */}
      {payment.requiresDoubleValidation && (
        <div className="p-4 rounded-xl border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-200">
                Double validation requise
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Montant ≥ 5M FCFA : validation Bureau Finance (R) puis autorisation DG (A).
                Chaque étape génère un hash de traçabilité.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Facture Match */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Facture associée
        </h4>
        
        {payment.matchedFacture ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-blue-500">{payment.matchedFacture.id}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {payment.matchedFacture.fournisseur}
              </p>
            </div>
            <div className="text-right">
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                payment.matchQuality === 'strong' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}>
                {payment.matchQuality === 'strong' ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                Match {payment.matchQuality}
              </span>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mt-1">
                {formatFCFA(payment.matchedFacture.montantTTC)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Aucune facture associée</span>
          </div>
        )}
      </div>
      
      {/* Next Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          Continuer
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DocumentsStep({
  verified,
  onVerify,
  onBack,
  onNext,
}: {
  verified: boolean;
  onVerify: (v: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const documents = [
    { id: 'bc', name: 'Bon de commande', status: 'verified' },
    { id: 'facture', name: 'Facture fournisseur', status: 'verified' },
    { id: 'pv', name: 'PV de réception', status: 'pending' },
    { id: 'attestation', name: 'Attestation de service fait', status: 'verified' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Vérification documentaire
        </h4>
        
        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{doc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {doc.status === 'verified' ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Vérifié
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    En attente
                  </span>
                )}
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => onVerify(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
        />
        <div>
          <p className="font-medium">Je confirme avoir vérifié tous les documents</p>
          <p className="text-sm text-slate-500 mt-1">
            Cette action sera enregistrée avec horodatage et signature.
          </p>
        </div>
      </label>
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!verified}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors',
            verified
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          )}
        >
          Continuer
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BFValidationStep({
  state,
  onValidate,
  onBack,
  onNext,
}: {
  state: WorkflowState;
  onValidate: (comment?: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [comment, setComment] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    onValidate(comment);
    setIsValidating(false);
  };

  return (
    <div className="space-y-6">
      <div className={cn(
        'p-4 rounded-xl border-l-4',
        state.bfValidation.completed
          ? 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20'
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            state.bfValidation.completed
              ? 'bg-emerald-100 dark:bg-emerald-900/50'
              : 'bg-orange-100 dark:bg-orange-900/50'
          )}>
            {state.bfValidation.completed ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Building2 className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Étape 1 : Validation Bureau Finance (R)</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {state.bfValidation.completed
                ? `Validé par ${state.bfValidation.by} le ${state.bfValidation.at}`
                : 'Le responsable BF doit valider la conformité financière.'}
            </p>
            {state.bfValidation.hash && (
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                <Hash className="w-3 h-3 inline mr-1" />
                {state.bfValidation.hash.slice(0, 24)}...
              </p>
            )}
          </div>
        </div>
      </div>

      {!state.bfValidation.completed && (
        <>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="block text-sm font-medium mb-2">
              Commentaire de validation (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Observations, réserves, conditions..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                En validant, vous confirmez que les aspects financiers sont conformes. 
                Un hash SHA-256 sera généré pour traçabilité.
              </p>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        
        {state.bfValidation.completed ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Continuer vers DG
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validation...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Valider (BF)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function DGAuthorizationStep({
  state,
  onAuthorize,
  onBlock,
  onBack,
}: {
  state: WorkflowState;
  onAuthorize: (comment?: string) => void;
  onBlock: (reason: string) => void;
  onBack: () => void;
}) {
  const [comment, setComment] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);

  const handleAuthorize = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    onAuthorize(comment);
  };

  const handleBlock = async () => {
    if (!blockReason.trim()) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    onBlock(blockReason);
  };

  if (!state.bfValidation.completed) {
    return (
      <div className="p-8 text-center">
        <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h4 className="font-semibold text-lg mb-2">Étape verrouillée</h4>
        <p className="text-sm text-slate-500">
          La validation BF doit être complétée avant l'autorisation DG.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn(
        'p-4 rounded-xl border-l-4',
        state.dgAuthorization.completed
          ? 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            state.dgAuthorization.completed
              ? 'bg-emerald-100 dark:bg-emerald-900/50'
              : 'bg-indigo-100 dark:bg-indigo-900/50'
          )}>
            {state.dgAuthorization.completed ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Shield className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Étape 2 : Autorisation Direction Générale (A)</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {state.dgAuthorization.completed
                ? `Autorisé par ${state.dgAuthorization.by} le ${state.dgAuthorization.at}`
                : 'Le DG doit autoriser le paiement après validation BF.'}
            </p>
            {state.dgAuthorization.hash && (
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                <Hash className="w-3 h-3 inline mr-1" />
                {state.dgAuthorization.hash.slice(0, 24)}...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BF Validation Summary */}
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/10">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Validation BF confirmée</span>
        </div>
        {state.bfValidation.comment && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-6">
            "{state.bfValidation.comment}"
          </p>
        )}
      </div>

      {!state.dgAuthorization.completed && (
        <>
          {showBlockForm ? (
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10">
              <h4 className="font-medium text-red-700 dark:text-red-400 mb-3">
                Motif de blocage
              </h4>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Justificatif manquant, montant incorrect, non-conformité..."
                className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowBlockForm(false)}
                  className="px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleBlock}
                  disabled={!blockReason.trim() || isProcessing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirmer blocage
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <label className="block text-sm font-medium mb-2">
                  Commentaire d'autorisation (optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Notes pour le dossier..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    En autorisant, le paiement sera définitivement validé. 
                    Le hash final sera chaîné au journal d'audit (append-only).
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        
        {!state.dgAuthorization.completed && !showBlockForm && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBlockForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Bloquer
            </button>
            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Autorisation...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Autoriser (DG)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmationStep({
  payment,
  state,
  onExportEvidence,
  onClose,
}: {
  payment: PaymentForWorkflow;
  state: WorkflowState;
  onExportEvidence: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
          Paiement autorisé
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Le paiement {payment.id} a été validé avec succès.
        </p>
      </div>

      {/* Workflow Summary */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <h4 className="font-medium">Récapitulatif du workflow</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Validation BF</span>
            </div>
            <div className="text-right">
              <p className="text-sm">{state.bfValidation.by}</p>
              <p className="text-xs text-slate-500">{state.bfValidation.at}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Autorisation DG</span>
            </div>
            <div className="text-right">
              <p className="text-sm">{state.dgAuthorization.by}</p>
              <p className="text-xs text-slate-500">{state.dgAuthorization.at}</p>
            </div>
          </div>
        </div>

        {/* Hash info */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-mono text-slate-500">
            Chain Head: {state.dgAuthorization.hash?.slice(0, 32)}...
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onExportEvidence}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter preuves
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          Terminé
        </button>
      </div>
    </div>
  );
}

// ================================
// Main Modal Component
// ================================
export function PaymentWorkflowModal({
  open,
  payment,
  onClose,
  onComplete,
}: {
  open: boolean;
  payment?: PaymentForWorkflow | null;
  onClose: () => void;
  onComplete?: (result: { action: 'authorized' | 'blocked'; hash: string }) => void;
}) {
  const toast = usePaymentToast();
  
  const [state, setState] = useState<WorkflowState>({
    currentStep: 'overview',
    bfValidation: { completed: false },
    dgAuthorization: { completed: false },
    documentsVerified: false,
  });

  // Reset state when payment changes
  useEffect(() => {
    if (payment) {
      setState({
        currentStep: 'overview',
        bfValidation: { completed: false },
        dgAuthorization: { completed: false },
        documentsVerified: false,
      });
    }
  }, [payment?.id]);

  const steps = useMemo(() => {
    const base = [
      { id: 'overview' as WorkflowStep, label: 'Aperçu', icon: <Info className="w-4 h-4" /> },
      { id: 'documents' as WorkflowStep, label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    ];
    
    if (payment?.requiresDoubleValidation) {
      base.push(
        { id: 'bf_validation' as WorkflowStep, label: 'Validation BF', icon: <Building2 className="w-4 h-4" /> },
        { id: 'dg_authorization' as WorkflowStep, label: 'Autorisation DG', icon: <Shield className="w-4 h-4" /> },
      );
    }
    
    base.push({ id: 'confirmation' as WorkflowStep, label: 'Confirmation', icon: <Check className="w-4 h-4" /> });
    
    return base;
  }, [payment?.requiresDoubleValidation]);

  const completedSteps = useMemo(() => {
    const completed: WorkflowStep[] = [];
    const currentIdx = steps.findIndex(s => s.id === state.currentStep);
    
    steps.forEach((step, idx) => {
      if (idx < currentIdx) completed.push(step.id);
    });
    
    if (state.bfValidation.completed) completed.push('bf_validation');
    if (state.dgAuthorization.completed) completed.push('dg_authorization');
    
    return completed;
  }, [steps, state]);

  const goToStep = useCallback((step: WorkflowStep) => {
    setState(s => ({ ...s, currentStep: step }));
  }, []);

  const handleBFValidation = useCallback((comment?: string) => {
    const now = new Date().toISOString();
    const hash = `bf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    
    setState(s => ({
      ...s,
      bfValidation: {
        completed: true,
        by: 'F. DIOP (Chef BF)',
        at: new Date().toLocaleString('fr-FR'),
        hash,
        comment,
      },
    }));
    
    toast.success('Validation BF confirmée', 'Hash généré avec succès');
  }, [toast]);

  const handleDGAuthorization = useCallback((comment?: string) => {
    const hash = `dg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    
    setState(s => ({
      ...s,
      dgAuthorization: {
        completed: true,
        by: 'M. NDIAYE (DG)',
        at: new Date().toLocaleString('fr-FR'),
        hash,
        comment,
      },
      currentStep: 'confirmation',
    }));
    
    toast.success('Paiement autorisé', 'Workflow complété avec succès');
    onComplete?.({ action: 'authorized', hash });
  }, [toast, onComplete]);

  const handleBlock = useCallback((reason: string) => {
    setState(s => ({ ...s, blockReason: reason }));
    toast.warning('Paiement bloqué', reason);
    onComplete?.({ action: 'blocked', hash: `block_${Date.now()}` });
    onClose();
  }, [toast, onComplete, onClose]);

  const handleExportEvidence = useCallback(() => {
    toast.success('Export généré', 'Evidence pack téléchargé');
  }, [toast]);

  if (!open || !payment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-lg">
              {payment.requiresDoubleValidation ? 'Workflow BF → DG' : 'Validation directe'}
            </h2>
            <p className="text-sm text-slate-500">
              {payment.id} • {payment.beneficiary}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={state.currentStep} completedSteps={completedSteps} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.currentStep === 'overview' && (
            <OverviewStep 
              payment={payment} 
              onNext={() => goToStep('documents')} 
            />
          )}
          
          {state.currentStep === 'documents' && (
            <DocumentsStep
              verified={state.documentsVerified}
              onVerify={(v) => setState(s => ({ ...s, documentsVerified: v }))}
              onBack={() => goToStep('overview')}
              onNext={() => goToStep(payment.requiresDoubleValidation ? 'bf_validation' : 'confirmation')}
            />
          )}
          
          {state.currentStep === 'bf_validation' && (
            <BFValidationStep
              state={state}
              onValidate={handleBFValidation}
              onBack={() => goToStep('documents')}
              onNext={() => goToStep('dg_authorization')}
            />
          )}
          
          {state.currentStep === 'dg_authorization' && (
            <DGAuthorizationStep
              state={state}
              onAuthorize={handleDGAuthorization}
              onBlock={handleBlock}
              onBack={() => goToStep('bf_validation')}
            />
          )}
          
          {state.currentStep === 'confirmation' && (
            <ConfirmationStep
              payment={payment}
              state={state}
              onExportEvidence={handleExportEvidence}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

