'use client';

import { useDirectMode } from '@/contexts/direct-mode-context';
import { DirectModeDashboard } from './direct-mode-dashboard';

interface DashboardWrapperProps {
  children: React.ReactNode;
  upcomingEvent?: {
    id: string;
    starts_at: string;
    confirmed_count: number;
    max_players: number;
    venue_name?: string;
    price?: number;
    group_name: string;
  };
  stats?: {
    games: number;
    goals: number;
    assists: number;
    winRate: number;
  };
  topScorers?: Array<{
    name: string;
    goals: number;
    position: number;
  }>;
}

export function DashboardWrapper({ 
  children, 
  upcomingEvent, 
  stats, 
  topScorers 
}: DashboardWrapperProps) {
  const { isDirectMode } = useDirectMode();

  if (isDirectMode) {
    return (
      <DirectModeDashboard 
        upcomingEvent={upcomingEvent}
        stats={stats}
        topScorers={topScorers}
      />
    );
  }

  return <>{children}</>;
}

