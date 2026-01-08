/**
 * Composants Skeleton Loaders personnalisés
 * 
 * Fournit des skeleton loaders qui correspondent à la structure
 * réelle des composants pour une meilleure UX.
 */

import { Card, CardContent } from '@/components/ui/card';

/**
 * Skeleton loader pour le tableau RACI
 * 
 * Reproduit la structure du tableau avec header et lignes
 */
export function RACITableSkeleton() {
  return (
    <Card role="region" aria-label="Chargement de la matrice RACI">
      <CardContent className="p-0">
        {/* Header skeleton */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700" role="rowgroup">
          <div className="p-3">
            <div className="flex items-center gap-3">
              <div className="h-4 bg-slate-700 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/6 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/8 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/8 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/8 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/8 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Lignes skeleton */}
        <div className="p-4 space-y-2" role="rowgroup">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="h-4 bg-slate-700 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/6 animate-pulse" />
              <div className="h-6 w-6 bg-slate-700 rounded animate-pulse" />
              <div className="h-6 w-6 bg-slate-700 rounded animate-pulse" />
              <div className="h-6 w-6 bg-slate-700 rounded animate-pulse" />
              <div className="h-6 w-6 bg-slate-700 rounded animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/8 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/12 animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader pour la liste d'alertes
 * 
 * Reproduit la structure des cartes d'alerte
 */
export function AlertsListSkeleton() {
  return (
    <div className="space-y-2" role="region" aria-label="Chargement des alertes">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-l-4 border-slate-700">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* Checkbox skeleton */}
              <div className="h-4 w-4 bg-slate-700 rounded animate-pulse mt-1" />
              
              {/* Icône skeleton */}
              <div className="h-5 w-5 bg-slate-700 rounded animate-pulse flex-shrink-0" />
              
              {/* Contenu skeleton */}
              <div className="flex-1 space-y-2 min-w-0">
                {/* Badges skeleton */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="h-5 bg-slate-700 rounded w-16 animate-pulse" />
                  <div className="h-5 bg-slate-700 rounded w-20 animate-pulse" />
                  <div className="h-5 bg-slate-700 rounded w-24 animate-pulse" />
                </div>
                
                {/* Titre skeleton */}
                <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
                
                {/* Description skeleton */}
                <div className="space-y-1">
                  <div className="h-3 bg-slate-700 rounded w-full animate-pulse" />
                  <div className="h-3 bg-slate-700 rounded w-5/6 animate-pulse" />
                </div>
                
                {/* Date skeleton */}
                <div className="h-3 bg-slate-700 rounded w-1/3 animate-pulse" />
              </div>
              
              {/* Actions skeleton */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <div className="h-4 bg-slate-700 rounded w-16 animate-pulse" />
                <div className="h-4 bg-slate-700 rounded w-20 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader pour les indicateurs de performance
 */
export function PerformanceIndicatorsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3" role="region" aria-label="Chargement des indicateurs">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loader générique pour les cartes
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-slate-700 rounded animate-pulse ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </CardContent>
    </Card>
  );
}

