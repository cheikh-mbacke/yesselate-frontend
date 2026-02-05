// ============================================
// Skeleton loader pour l'onglet RACI
// ============================================

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton, RACITableSkeleton } from '@/components/ui/skeleton';

export function RACISkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width={200} height={24} />
            <div className="flex gap-2">
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </div>
          </div>
        </CardHeader>
      </Card>

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

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-4">
          <RACITableSkeleton rows={12} />
        </CardContent>
      </Card>
    </div>
  );
}

