'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { contractsToSign, raciMatrix, employees } from '@/lib/data';
import type { Contract } from '@/lib/types/bmo.types';

// =========================
// Utils robustes (money/date)
// =========================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const formatFCFA = (v: unknown): string => {
  const n = parseMoney(v);
  return `${n.toLocaleString('fr-FR')} FCFA`;
};

const parseFRDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yy) return null;
  // IMPORTANT: neutraliser l'heure pour éviter les écarts de J- selon l'heure locale
  return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
};

// Utilitaire pour générer un hash SHA3-256 simulé
const generateSHA3Hash = (data: string): string => {
  let hash = 0;
  const timestamp = Date.now();
  const combined = `${data}-${timestamp}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
  return `SHA3-256:${hexHash}${Math.random().toString(16).slice(2, 10)}`;
};

// Calculer les jours avant expiration
const getDaysToExpiry = (expiryStr: string): number | null => {
  const expiryDate = parseFRDate(expiryStr);
  if (!expiryDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Vérifier si un bureau a le droit de signer selon RACI
const checkRACIPermission = (bureau: string): { allowed: boolean; role: string } => {
  const row = raciMatrix.find((r) => r.activity === 'Signature contrats');
  if (!row) return { allowed: false, role: 'N/A' };
  
  const bureauKey = bureau as keyof typeof row;
  const role = row[bureauKey] as string;
  
  // Seul BJ (R) et BMO (A) peuvent signer
  const allowed = role === 'R' || role === 'A';
  return { allowed, role };
};

type ViewMode = 'all' | 'urgent' | 'type';

export default function ValidationContratsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('urgent');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [doubleValidationRequired, setDoubleValidationRequired] = useState(false);
  const [bjValidation, setBjValidation] = useState(false);

  // Utilisateur actuel (simulé)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Enrichir les contrats avec les jours avant expiration
  const enrichedContracts = useMemo(() => {
    return contractsToSign.map((c) => ({
      ...c,
      daysToExpiry: getDaysToExpiry(c.expiry),
      amountValue: parseMoney(c.amount),
    }));
  }, []);

  // Trier par urgence (proches d'échéance d'abord)
  const sortedByUrgency = useMemo(() => {
    return [...enrichedContracts].sort((a, b) => {
      if (a.daysToExpiry === null) return 1;
      if (b.daysToExpiry === null) return -1;
      return a.daysToExpiry - b.daysToExpiry;
    });
  }, [enrichedContracts]);

  // Grouper par type
  const contractsByType = useMemo(() => ({
    marche: enrichedContracts.filter((c) => c.type === 'Marché'),
    avenant: enrichedContracts.filter((c) => c.type === 'Avenant'),
    soustraitance: enrichedContracts.filter((c) => c.type === 'Sous-traitance'),
  }), [enrichedContracts]);

  // Stats
  const stats = {
    total: contractsToSign.length,
    urgent: enrichedContracts.filter((c) => c.daysToExpiry !== null && c.daysToExpiry <= 7).length,
    marche: contractsByType.marche.length,
    avenant: contractsByType.avenant.length,
    soustraitance: contractsByType.soustraitance.length,
  };

  // Juriste responsable (BJ)
  const bjJurist = employees.find((e) => e.bureau === 'BJ' && e.role.includes('Juriste'));

  // Signer un contrat avec double contrôle
  const handleSign = (contract: Contract) => {
    // Vérifier RACI
    const raciCheck = checkRACIPermission(currentUser.bureau);

    // ✅ RACI réellement appliqué
    if (!raciCheck.allowed) {
      addToast(`❌ RACI: Votre bureau (${currentUser.bureau}) n'est pas autorisé. Rôle: ${raciCheck.role}`, 'error');
      return;
    }
    
    // ✅ Logique métier: Double contrôle BJ requis pour TOUT contrat à signer (sauf si explicitement dispensé)
    // Si tu veux des exemptions: ajoute un champ contract.requiresBJValidation (ou type) plus tard.
    if (!bjValidation) {
      setSelectedContract(contract);
      setDoubleValidationRequired(true);
      setShowSignModal(true);
      addToast('⚠️ Double contrôle requis: validation BJ nécessaire', 'warning');
      return;
    }

    const hash = generateSHA3Hash(`${contract.id}-${currentUser.id}-sign-${Date.now()}`);
    const timestamp = new Date().toISOString();

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'signature',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `Contrat signé - Type: ${contract.type} - Partenaire: ${contract.partner} - Hash: ${hash} - Timestamp: ${timestamp}`,
      bureau: contract.bureau,
    });

    addToast(`✓ ${contract.id} signé - Hash: ${hash.slice(0, 25)}...`, 'success');
    setShowSignModal(false);
    setSelectedContract(null);
    setBjValidation(false);
    setDoubleValidationRequired(false);
  };

  // Renvoyer au BJ
  const handleSendToBJ = (contract: Contract) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'renvoi',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `Renvoyé au BJ pour révision`,
      bureau: 'BJ',
    });

    addToast(`📤 ${contract.id} renvoyé au Bureau Juridique`, 'info');
  };

  // Demander arbitrage
  const handleRequestArbitrage = (contract: Contract) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'arbitrage',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `Demande d'arbitrage initiée`,
      bureau: contract.bureau,
    });

    addToast(`⚖️ Arbitrage demandé pour ${contract.id}`, 'warning');
  };

  // Validation BJ simulée
  const handleBJValidation = () => {
    setBjValidation(true);
    addToast('✓ Validation BJ confirmée - Vous pouvez maintenant signer', 'success');
  };

  // Afficher les contrats selon le mode
  const displayContracts = viewMode === 'urgent' ? sortedByUrgency : enrichedContracts;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Contrats à signer
            <Badge variant="gold">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Double contrôle BJ obligatoire • Hash + Horodatage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">RACI:</span>
          <Badge variant="success">BJ = R</Badge>
          <Badge variant="warning">BMO = A</Badge>
        </div>
      </div>

      {/* Alerte contrats urgents */}
      {stats.urgent > 0 && (
        <div className={cn(
          'rounded-xl p-3 flex items-center gap-3 border animate-pulse',
          darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        )}>
          <span className="text-2xl">⏰</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">
              {stats.urgent} contrat(s) proche(s) d'échéance (&lt; 7 jours)
            </p>
            <p className="text-xs text-slate-400">
              Signature requise rapidement pour éviter les pénalités
            </p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setViewMode('urgent')}>
            Voir urgents
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <Card className={cn('cursor-pointer', viewMode === 'all' && 'ring-2 ring-orange-500')} onClick={() => setViewMode('all')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className={cn('border-red-500/30 cursor-pointer', viewMode === 'urgent' && 'ring-2 ring-red-500')} onClick={() => setViewMode('urgent')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            <p className="text-[10px] text-slate-400">Urgents</p>
          </CardContent>
        </Card>
        <Card className={cn('cursor-pointer', viewMode === 'type' && 'ring-2 ring-purple-500')} onClick={() => setViewMode('type')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.marche}</p>
            <p className="text-[10px] text-slate-400">Marchés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.avenant}</p>
            <p className="text-[10px] text-slate-400">Avenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.soustraitance}</p>
            <p className="text-[10px] text-slate-400">Sous-traitance</p>
          </CardContent>
        </Card>
      </div>

      {/* Vue par type */}
      {viewMode === 'type' && (
        <div className="space-y-4">
          {Object.entries(contractsByType).map(([type, contracts]) => contracts.length > 0 && (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {type === 'marche' ? '📋 Marchés' : type === 'avenant' ? '📝 Avenants' : '🤝 Sous-traitance'}
                  <Badge variant="info">{contracts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contracts.map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    darkMode={darkMode}
                    onSign={() => handleSign(contract)}
                    onSendToBJ={() => handleSendToBJ(contract)}
                    onArbitrage={() => handleRequestArbitrage(contract)}
                    onClose={() => {}}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue liste (all ou urgent) */}
      {(viewMode === 'all' || viewMode === 'urgent') && (
        <div className="space-y-3">
          {displayContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              darkMode={darkMode}
              onSign={() => handleSign(contract)}
              onSendToBJ={() => handleSendToBJ(contract)}
              onArbitrage={() => handleRequestArbitrage(contract)}
              onClose={() => {}}
            />
          ))}
        </div>
      )}

      {/* Modal double validation */}
      {showSignModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto overscroll-contain">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🔐 Double contrôle requis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <p className="font-bold text-sm">{selectedContract.subject}</p>
                <p className="text-xs text-slate-400">{selectedContract.partner}</p>
                <p className="font-mono text-amber-400 mt-2">{formatFCFA(selectedContract.amount)}</p>
              </div>

              {/* Étape 1: Validation BJ */}
              <div className={cn(
                'p-3 rounded-lg border-l-4',
                bjValidation ? 'border-l-emerald-500 bg-emerald-500/10' : 'border-l-amber-500 bg-amber-500/10'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{bjValidation ? '✓' : '1️⃣'}</span>
                    <div>
                      <p className="font-bold text-sm">Validation Bureau Juridique</p>
                      <p className="text-[10px] text-slate-400">
                        {bjJurist?.name || 'N. FAYE'} - {bjJurist?.role || 'Juriste Senior'}
                      </p>
                    </div>
                  </div>
                  {!bjValidation && (
                    <Button size="sm" variant="warning" onClick={handleBJValidation}>
                      Simuler validation BJ
                    </Button>
                  )}
                  {bjValidation && <Badge variant="success">✓ Validé</Badge>}
                </div>
              </div>

              {/* Étape 2: Signature DG */}
              <div className={cn(
                'p-3 rounded-lg border-l-4',
                bjValidation ? 'border-l-emerald-500' : 'border-l-slate-500 opacity-50',
                bjValidation ? 'bg-emerald-500/10' : 'bg-slate-500/10'
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">2️⃣</span>
                  <div>
                    <p className="font-bold text-sm">Signature Directeur Général</p>
                    <p className="text-[10px] text-slate-400">{currentUser.name} - {currentUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  className="flex-1"
                  disabled={!bjValidation}
                  onClick={() => handleSign(selectedContract)}
                >
                  ✍️ Signer le contrat
                </Button>
                <Button variant="secondary" onClick={() => {
                  setShowSignModal(false);
                  setBjValidation(false);
                  setDoubleValidationRequired(false);
                  setSelectedContract(null);
                }}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info juridique */}
      <Card className="border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h3 className="font-bold text-sm text-purple-400">
                Procédure de signature - Double contrôle
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Conformément à la matrice RACI, tous les contrats nécessitent une double validation :
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-blue-400 font-bold">1. Bureau Juridique (R)</span>
                  <p className="text-[10px] text-slate-400">Validation conformité légale</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-amber-400 font-bold">2. BMO / DG (A)</span>
                  <p className="text-[10px] text-slate-400">Signature finale + Hash SHA3-256</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant carte contrat
function ContractCard({
  contract,
  darkMode,
  onSign,
  onSendToBJ,
  onArbitrage,
  onClose,
}: {
  contract: Contract & { daysToExpiry?: number | null };
  darkMode: boolean;
  onSign: () => void;
  onSendToBJ: () => void;
  onArbitrage: () => void;
  onClose: () => void;
}) {
  const isUrgent = contract.daysToExpiry !== null && contract.daysToExpiry <= 7;
  const isExpired = contract.daysToExpiry !== null && contract.daysToExpiry < 0;

  return (
    <Card className={cn(
      'hover:border-orange-500/50 transition-all',
      isExpired && 'border-l-4 border-l-red-500 bg-red-500/5',
      isUrgent && !isExpired && 'border-l-4 border-l-amber-500'
    )}>
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
                {contract.id}
              </span>
              <Badge variant="gold">{contract.type}</Badge>
              <BureauTag bureau={contract.bureau} />
              {isExpired && <Badge variant="urgent" pulse>EXPIRÉ</Badge>}
              {isUrgent && !isExpired && (
                <Badge variant="warning">J-{contract.daysToExpiry}</Badge>
              )}
            </div>
            <h3 className="font-bold text-sm mt-1">{contract.subject}</h3>
          </div>
          <span className="font-mono font-bold text-lg text-amber-400">
            {formatFCFA(contract.amount)}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Partenaire: </span>
            <span className="font-semibold">{contract.partner}</span>
          </div>
          <div>
            <span className="text-slate-400">Préparé par: </span>
            <span>{contract.preparedBy}</span>
          </div>
          <div>
            <span className="text-slate-400">Expiration: </span>
            <span className={isUrgent ? 'text-red-400 font-bold' : ''}>
              {contract.expiry}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Date: </span>
            <span>{contract.date}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={onSign}
          >
            ✍️ Signer
          </Button>
          <Button variant="info" onClick={onSendToBJ}>
            📤 Renvoyer BJ
          </Button>
          <Button variant="warning" onClick={onArbitrage}>
            ⚖️ Arbitrage
          </Button>
          <Button variant="destructive" onClick={onClose} title="Fermer / ignorer">
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
