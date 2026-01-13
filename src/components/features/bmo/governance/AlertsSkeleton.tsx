// ============================================
// Skeleton loader pour l'onglet Alertes
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton, AlertCardSkeleton } from '@/components/ui/skeleton';

export function AlertsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton variant="text" width="60%" height={14} />
              <Skeleton variant="text" width="40%" height={24} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={100} height={32} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

