'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { contractsToSign } from '@/lib/data';

export default function ValidationContratsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Contrats à signer
            <Badge variant="gold">{contractsToSign.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Contrats en attente de signature DG
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {contractsToSign.filter((c) => c.type === 'Marché').length}
            </p>
            <p className="text-[10px] text-slate-400">Marchés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {contractsToSign.filter((c) => c.type === 'Avenant').length}
            </p>
            <p className="text-[10px] text-slate-400">Avenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {contractsToSign.filter((c) => c.type === 'Sous-traitance').length}
            </p>
            <p className="text-[10px] text-slate-400">Sous-traitance</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des contrats */}
      <div className="space-y-3">
        {contractsToSign.map((contract, i) => (
          <Card
            key={i}
            className="hover:border-orange-500/50 transition-all"
          >
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
                      {contract.id}
                    </span>
                    <Badge variant="gold">{contract.type}</Badge>
                  </div>
                  <h3 className="font-bold text-sm mt-1">{contract.subject}</h3>
                </div>
                <span className="font-mono font-bold text-lg text-amber-400">
                  {contract.amount}
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
                  <span>{contract.expiry}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span>{contract.date}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => addToast(`${contract.id} signé ✔`, 'success')}
                >
                  ✏️ Signer
                </Button>
                <Button
                  variant="info"
                  onClick={() => addToast(`Aperçu ${contract.id}`, 'info')}
                >
                  📄 Voir
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => addToast(`${contract.id} rejeté`, 'warning')}
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info juridique */}
      <Card className="border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h3 className="font-bold text-sm text-purple-400">
                Signature électronique
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tous les contrats signés sont horodatés avec une signature
                électronique SHA-256 conforme aux normes OHADA. Les documents
                originaux sont archivés de manière sécurisée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
