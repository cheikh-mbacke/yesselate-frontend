'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  bcToValidate,
  facturesToValidate,
  avenantsToValidate,
  raciMatrix,
  projects,
  decisions,
} from '@/lib/data';
import type { PurchaseOrder, Invoice, Amendment } from '@/lib/types/bmo.types';

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

// Vérifier si un bureau a le droit de valider selon RACI
const checkRACIPermission = (bureau: string, activity: string): { allowed: boolean; role: string } => {
  const row = raciMatrix.find((r) => r.activity === activity);
  if (!row) return { allowed: false, role: 'N/A' };
  
  const bureauKey = bureau as keyof typeof row;
  const role = row[bureauKey] as string;
  
  // Seuls R (Responsible) et A (Accountable) peuvent valider
  const allowed = role === 'R' || role === 'A';
  return { allowed, role };
};

type TabType = 'bc' | 'factures' | 'avenants';
type GroupMode = 'list' | 'project' | 'priority';

export default function ValidationBCPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('bc');
  const [groupMode, setGroupMode] = useState<GroupMode>('project');
  const [selectedItem, setSelectedItem] = useState<PurchaseOrder | Invoice | Amendment | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Utilisateur actuel (simulé - normalement depuis auth)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Grouper les BC par projet
  const bcByProject = useMemo(() => {
    const grouped: Record<string, PurchaseOrder[]> = {};
    bcToValidate.forEach((bc) => {
      if (!grouped[bc.project]) grouped[bc.project] = [];
      grouped[bc.project].push(bc);
    });
    return grouped;
  }, []);

  // Grouper par priorité
  const bcByPriority = useMemo(() => ({
    urgent: bcToValidate.filter((bc) => bc.priority === 'urgent'),
    high: bcToValidate.filter((bc) => bc.priority === 'high'),
    normal: bcToValidate.filter((bc) => bc.priority === 'normal'),
  }), []);

  // Stats
  const stats = {
    bc: bcToValidate.length,
    factures: facturesToValidate.length,
    avenants: avenantsToValidate.length,
    total: bcToValidate.length + facturesToValidate.length + avenantsToValidate.length,
    urgent: bcToValidate.filter((bc) => bc.priority === 'urgent').length,
  };

  // Valider un BC avec création de décision et hash
  const handleValidateBC = (bc: PurchaseOrder) => {
    // Vérifier RACI
    const raciCheck = checkRACIPermission(currentUser.bureau, 'Validation BC');
    
    if (!raciCheck.allowed && currentUser.bureau !== 'BMO') {
      addToast(`❌ RACI: Votre bureau (${currentUser.bureau}) n'est pas autorisé à valider. Rôle: ${raciCheck.role}`, 'error');
      return;
    }

    const hash = generateSHA3Hash(`${bc.id}-${currentUser.id}-validate`);
    const decisionId = `DEC-${Date.now().toString().slice(-8)}`;

    // Créer entrée dans decisions
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'validation',
      module: 'validation-bc',
      targetId: bc.id,
      targetType: 'Bon de commande',
      targetLabel: bc.subject,
      details: `BC validé - Montant: ${bc.amount} FCFA - Decision: ${decisionId} - Hash: ${hash}`,
      bureau: bc.bureau,
    });

    addToast(
      `✓ ${bc.id} validé - Hash: ${hash.slice(0, 25)}...`,
      'success'
    );
    setShowValidationModal(false);
  };

  // Rejeter un BC
  const handleRejectBC = (bc: PurchaseOrder, reason: string = 'Non conforme') => {
    const hash = generateSHA3Hash(`${bc.id}-${currentUser.id}-reject`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'rejet',
      module: 'validation-bc',
      targetId: bc.id,
      targetType: 'Bon de commande',
      targetLabel: bc.subject,
      details: `BC rejeté - Motif: ${reason} - Hash: ${hash}`,
      bureau: bc.bureau,
    });

    addToast(`❌ ${bc.id} rejeté - ${reason}`, 'warning');
  };

  // Demander pièce complémentaire
  const handleRequestDocument = (bc: PurchaseOrder) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'complement',
      module: 'validation-bc',
      targetId: bc.id,
      targetType: 'Bon de commande',
      targetLabel: bc.subject,
      details: 'Demande de pièce complémentaire',
      bureau: bc.bureau,
    });

    addToast(`📎 Demande de pièce envoyée pour ${bc.id}`, 'info');
  };

  // Escalader
  const handleEscalate = (bc: PurchaseOrder) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'escalade',
      module: 'validation-bc',
      targetId: bc.id,
      targetType: 'Bon de commande',
      targetLabel: bc.subject,
      details: 'Escalade vers DG',
      bureau: bc.bureau,
    });

    addToast(`⬆️ ${bc.id} escaladé vers DG`, 'warning');
  };

  const tabs = [
    { id: 'bc' as TabType, label: 'BC', count: stats.bc, icon: '📋', color: 'emerald' },
    { id: 'factures' as TabType, label: 'Factures', count: stats.factures, icon: '🧾', color: 'blue' },
    { id: 'avenants' as TabType, label: 'Avenants', count: stats.avenants, icon: '📝', color: 'purple' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ✅ Validation BC / Factures / Avenants
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Verrou RACI actif • Hash SHA3-256 sur chaque validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">RACI:</span>
          <Badge variant="success">BMO = A</Badge>
          <Badge variant="info">BM = R</Badge>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.bc}</p>
            <p className="text-[10px] text-slate-400">BC en attente</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.factures}</p>
            <p className="text-[10px] text-slate-400">Factures</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.avenants}</p>
            <p className="text-[10px] text-slate-400">Avenants</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            <p className="text-[10px] text-slate-400">Urgents</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? 'default' : 'secondary'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
        {activeTab === 'bc' && (
          <div className="flex gap-1">
            <Button size="xs" variant={groupMode === 'project' ? 'default' : 'ghost'} onClick={() => setGroupMode('project')}>
              Par projet
            </Button>
            <Button size="xs" variant={groupMode === 'priority' ? 'default' : 'ghost'} onClick={() => setGroupMode('priority')}>
              Par priorité
            </Button>
            <Button size="xs" variant={groupMode === 'list' ? 'default' : 'ghost'} onClick={() => setGroupMode('list')}>
              Liste
            </Button>
          </div>
        )}
      </div>

      {/* Tab BC */}
      {activeTab === 'bc' && (
        <>
          {/* Vue groupée par projet */}
          {groupMode === 'project' && (
            <div className="space-y-4">
              {Object.entries(bcByProject).map(([projectId, bcs]) => {
                const project = projects.find((p) => p.id === projectId);
                return (
                  <Card key={projectId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">{projectId}</span>
                          <span>{project?.name || 'Projet inconnu'}</span>
                          <Badge variant="info">{bcs.length} BC</Badge>
                        </div>
                        {project && (
                          <span className="text-xs text-slate-400">
                            Budget: {project.budget} • Avancement: {project.progress}%
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                              <th className="px-3 py-2 text-left font-bold text-amber-500">BC</th>
                              <th className="px-3 py-2 text-left font-bold text-amber-500">Objet</th>
                              <th className="px-3 py-2 text-left font-bold text-amber-500">Fournisseur</th>
                              <th className="px-3 py-2 text-left font-bold text-amber-500">Montant</th>
                              <th className="px-3 py-2 text-left font-bold text-amber-500">Priorité</th>
                              <th className="px-3 py-2 text-left font-bold text-amber-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bcs.map((bc) => (
                              <tr key={bc.id} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                                <td className="px-3 py-2">
                                  <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                    {bc.id}
                                  </span>
                                </td>
                                <td className="px-3 py-2 max-w-[200px] truncate">{bc.subject}</td>
                                <td className="px-3 py-2">{bc.supplier}</td>
                                <td className="px-3 py-2 font-mono font-bold text-amber-400">{bc.amount}</td>
                                <td className="px-3 py-2">
                                  <Badge variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'} pulse={bc.priority === 'urgent'}>
                                    {bc.priority}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1">
                                    <Button size="xs" variant="success" onClick={() => handleValidateBC(bc)}>✓</Button>
                                    <Button size="xs" variant="info" onClick={() => { setSelectedItem(bc); setShowValidationModal(true); }}>👁</Button>
                                    <Button size="xs" variant="warning" onClick={() => handleRequestDocument(bc)}>📎</Button>
                                    <Button size="xs" variant="secondary" onClick={() => handleEscalate(bc)}>⬆️</Button>
                                    <Button size="xs" variant="destructive" onClick={() => handleRejectBC(bc)}>✕</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Vue groupée par priorité */}
          {groupMode === 'priority' && (
            <div className="space-y-4">
              {bcByPriority.urgent.length > 0 && (
                <Card className="border-red-500/30">
                  <CardHeader className="pb-2 bg-red-500/10">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                      🚨 Urgent <Badge variant="urgent">{bcByPriority.urgent.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    {bcByPriority.urgent.map((bc) => (
                      <BCCard key={bc.id} bc={bc} darkMode={darkMode} onValidate={handleValidateBC} onReject={handleRejectBC} onRequest={handleRequestDocument} onEscalate={handleEscalate} />
                    ))}
                  </CardContent>
                </Card>
              )}
              {bcByPriority.high.length > 0 && (
                <Card className="border-amber-500/30">
                  <CardHeader className="pb-2 bg-amber-500/10">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                      ⚠️ Prioritaire <Badge variant="warning">{bcByPriority.high.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    {bcByPriority.high.map((bc) => (
                      <BCCard key={bc.id} bc={bc} darkMode={darkMode} onValidate={handleValidateBC} onReject={handleRejectBC} onRequest={handleRequestDocument} onEscalate={handleEscalate} />
                    ))}
                  </CardContent>
                </Card>
              )}
              {bcByPriority.normal.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      📋 Normal <Badge variant="default">{bcByPriority.normal.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    {bcByPriority.normal.map((bc) => (
                      <BCCard key={bc.id} bc={bc} darkMode={darkMode} onValidate={handleValidateBC} onReject={handleRejectBC} onRequest={handleRequestDocument} onEscalate={handleEscalate} />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Vue liste */}
          {groupMode === 'list' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">BC</th>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">Projet</th>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">Objet</th>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">Fournisseur</th>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">Montant</th>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">Priorité</th>
                        <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bcToValidate.map((bc) => (
                        <tr key={bc.id} className={cn('border-t hover:bg-orange-500/5', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                          <td className="px-3 py-2.5">
                            <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{bc.id}</span>
                          </td>
                          <td className="px-3 py-2.5 text-orange-400">{bc.project}</td>
                          <td className="px-3 py-2.5 max-w-[150px] truncate">{bc.subject}</td>
                          <td className="px-3 py-2.5">{bc.supplier}</td>
                          <td className="px-3 py-2.5 font-mono font-bold">{bc.amount}</td>
                          <td className="px-3 py-2.5">
                            <Badge variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'} pulse={bc.priority === 'urgent'}>
                              {bc.priority}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex gap-1">
                              <Button size="xs" variant="success" onClick={() => handleValidateBC(bc)}>✓</Button>
                              <Button size="xs" variant="info" onClick={() => { setSelectedItem(bc); setShowValidationModal(true); }}>👁</Button>
                              <Button size="xs" variant="destructive" onClick={() => handleRejectBC(bc)}>✕</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tab Factures */}
      {activeTab === 'factures' && (
        <div className="space-y-3">
          {facturesToValidate.map((facture) => (
            <Card key={facture.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">{facture.id}</span>
                      <BureauTag bureau={facture.bureau} />
                    </div>
                    <h3 className="font-bold text-sm mt-1">{facture.objet}</h3>
                    <p className="text-xs text-slate-400">{facture.fournisseur}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-lg text-blue-400">{facture.montant} FCFA</span>
                    <p className="text-[10px] text-slate-500">Échéance: {facture.dateEcheance}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-slate-400">Projet: </span><span className="text-orange-400">{facture.projet}</span></div>
                  <div><span className="text-slate-400">Date facture: </span>{facture.dateFacture}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" className="flex-1" onClick={() => addToast(`Facture ${facture.id} validée ✓`, 'success')}>
                    ✓ Valider facture
                  </Button>
                  <Button size="sm" variant="info" onClick={() => addToast(`Détails facture`, 'info')}>📄</Button>
                  <Button size="sm" variant="warning" onClick={() => addToast(`Facture ${facture.id} contestée`, 'warning')}>⚠️</Button>
                  <Button size="sm" variant="destructive" onClick={() => addToast(`Facture ${facture.id} rejetée`, 'error')}>✕</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Avenants */}
      {activeTab === 'avenants' && (
        <div className="space-y-3">
          {avenantsToValidate.map((avenant) => (
            <Card key={avenant.id} className={cn(avenant.impact === 'Financier' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-500')}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">{avenant.id}</span>
                      <Badge variant={avenant.impact === 'Financier' ? 'warning' : 'info'}>{avenant.impact}</Badge>
                      <BureauTag bureau={avenant.bureau} />
                    </div>
                    <h3 className="font-bold text-sm mt-1">{avenant.objet}</h3>
                    <p className="text-xs text-slate-400">Contrat: {avenant.contratRef} • {avenant.partenaire}</p>
                  </div>
                  {avenant.montant && <span className="font-mono font-bold text-lg text-amber-400">+{avenant.montant} FCFA</span>}
                </div>
                <div className={cn('p-2 rounded-lg text-xs mb-3', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-slate-400">Justification: </span>{avenant.justification}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => addToast(`Avenant ${avenant.id} approuvé ✓`, 'success')}>
                    ✓ Approuver avenant
                  </Button>
                  <Button size="sm" variant="info">📄</Button>
                  <Button size="sm" variant="warning">↩️</Button>
                  <Button size="sm" variant="destructive">✕</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info RACI */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">Verrou RACI - Validation BC</h3>
              <p className="text-xs text-slate-400 mt-1">
                Seuls les bureaux avec rôle <span className="text-emerald-400 font-bold">R (Responsible)</span> ou <span className="text-amber-400 font-bold">A (Accountable)</span> 
                peuvent valider. Chaque validation génère un hash SHA3-256 horodaté et crée une entrée dans le registre des décisions.
              </p>
              <div className="flex gap-2 mt-2 text-[10px]">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">BMO = A (Accountable)</span>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">BM = R (Responsible)</span>
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400">BA = R (Responsible)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant carte BC réutilisable
function BCCard({
  bc,
  darkMode,
  onValidate,
  onReject,
  onRequest,
  onEscalate,
}: {
  bc: PurchaseOrder;
  darkMode: boolean;
  onValidate: (bc: PurchaseOrder) => void;
  onReject: (bc: PurchaseOrder, reason?: string) => void;
  onRequest: (bc: PurchaseOrder) => void;
  onEscalate: (bc: PurchaseOrder) => void;
}) {
  return (
    <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{bc.id}</span>
            <span className="text-xs text-orange-400">{bc.project}</span>
            <BureauTag bureau={bc.bureau} />
          </div>
          <p className="text-sm font-semibold">{bc.subject}</p>
          <p className="text-[10px] text-slate-400">{bc.supplier}</p>
        </div>
        <span className="font-mono font-bold text-amber-400">{bc.amount}</span>
      </div>
      <div className="flex gap-1 mt-2">
        <Button size="xs" variant="success" onClick={() => onValidate(bc)}>✓ Valider</Button>
        <Button size="xs" variant="warning" onClick={() => onRequest(bc)}>📎 Pièce</Button>
        <Button size="xs" variant="secondary" onClick={() => onEscalate(bc)}>⬆️</Button>
        <Button size="xs" variant="destructive" onClick={() => onReject(bc)}>✕</Button>
      </div>
    </div>
  );
}
