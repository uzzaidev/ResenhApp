import { GridSkeleton } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-br from-uzzai-blue via-uzzai-blue/90 to-uzzai-mint rounded-xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 bg-white/20" />
            <Skeleton className="h-6 w-96 bg-white/10" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 bg-white/20" />
            <Skeleton className="h-10 w-32 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <GridSkeleton cols={3} rows={1} />

      {/* Cards Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
