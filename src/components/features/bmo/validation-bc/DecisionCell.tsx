'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Composant réutilisable pour afficher les cellules de décision BMO dans les tableaux
// WHY: Chaque décision BMO doit avoir un hash SHA3-256 horodaté pour garantir l'intégrité et la traçabilité
// Le rôle RACI ('A' ou 'R') détermine qui est responsable de la validation
export function DecisionCell({ item }: { item: any }) {
  return (
    <td className="px-3 py-2.5 text-xs">
      {item.decisionBMO ? (
        <div className="flex flex-col gap-0.5">
          <Badge variant="default" className="text-[9px]">
            {item.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
          </Badge>
          {item.decisionBMO.decisionId && (
            <Button
              size="xs"
              variant="link"
              className="p-0 h-auto text-blue-400"
              onClick={() => window.open(`/decisions?id=${item.decisionBMO?.decisionId}`, '_blank')}
            >
              📄 Voir
            </Button>
          )}
        </div>
      ) : (
        <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
      )}
    </td>
  );
}

