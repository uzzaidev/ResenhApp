import { GridSkeleton } from '@/components/ui/loading-skeleton';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function FinanceiroLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <GridSkeleton cols={4} rows={1} />

      {/* Charges Table Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}

