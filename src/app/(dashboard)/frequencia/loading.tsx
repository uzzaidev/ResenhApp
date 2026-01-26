import { GridSkeleton } from '@/components/ui/loading-skeleton';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function FrequenciaLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Metrics Grid Skeleton */}
      <GridSkeleton cols={4} rows={1} />

      {/* Top Players Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <ListSkeleton items={10} />
        </CardContent>
      </Card>

      {/* Recent Events Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <ListSkeleton items={5} />
        </CardContent>
      </Card>
    </div>
  );
}

