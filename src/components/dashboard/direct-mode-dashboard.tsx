'use client';

import { useDirectMode } from '@/contexts/direct-mode-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  DollarSign, 
  Trophy, 
  Activity, 
  Users, 
  Calendar,
  Zap,
  TrendingUp,
  Award,
  Shield,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface DirectModeDashboardProps {
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

export function DirectModeDashboard({ 
  upcomingEvent, 
  stats, 
  topScorers 
}: DirectModeDashboardProps) {
  const { isDirectMode } = useDirectMode();

  if (!isDirectMode) {
    return null; // Não renderizar se não estiver em modo direto
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-uzzai-black via-[#0f242a] to-uzzai-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header com Badge Beta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-uzzai-mint/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-uzzai-mint" />
            </div>
            <div>
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-white/10 rounded mt-1"></div>
            </div>
          </div>
          <div className="relative">
            <div className="h-5 w-5 text-uzzai-silver">
              <Activity className="h-5 w-5" />
            </div>
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-uzzai-gold rounded-full text-[8px] flex items-center justify-center text-uzzai-black font-bold">
              3
            </span>
          </div>
        </div>

        {/* Próxima Pelada Card */}
        {upcomingEvent && (
          <Card className="relative border-uzzai-mint/30 bg-white/5 backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-uzzai-mint to-uzzai-blue rounded-t-lg"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-uzzai-mint uppercase">
                  Próxima Pelada
                </CardTitle>
                <span className="text-xs text-uzzai-silver">
                  {new Date(upcomingEvent.starts_at).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmados</span>
                <span className="text-lg font-bold text-uzzai-mint">
                  {upcomingEvent.confirmed_count}/{upcomingEvent.max_players}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-uzzai-mint to-uzzai-blue h-2 rounded-full transition-all"
                  style={{ width: `${(upcomingEvent.confirmed_count / upcomingEvent.max_players) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-uzzai-silver">
                {upcomingEvent.venue_name || 'Local a definir'} • {upcomingEvent.price ? `R$ ${upcomingEvent.price.toFixed(2)}/pessoa` : 'Grátis'}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button className="bg-uzzai-mint/20 border border-uzzai-mint/30 text-uzzai-mint hover:bg-uzzai-mint/30">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button className="bg-uzzai-gold/10 border border-uzzai-gold/30 text-uzzai-gold hover:bg-uzzai-gold/20">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Split Pix
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Artilheiros */}
        {topScorers && topScorers.length > 0 && (
          <Card className="relative border-uzzai-gold/30 bg-white/5 backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-uzzai-gold to-uzzai-mint rounded-t-lg"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-uzzai-gold uppercase flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Top 3 Artilheiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topScorers.map((scorer, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      index === 0 ? 'text-uzzai-gold' : 
                      index === 1 ? 'text-gray-400' : 
                      'text-orange-700'
                    }`}>
                      {index + 1}º
                    </span>
                    <span>{scorer.name}</span>
                  </div>
                  <span className="font-bold text-uzzai-mint">{scorer.goals} gols</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Pessoais */}
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            <Card className="text-center p-3 bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-uzzai-mint">{stats.games}</div>
              <div className="text-[10px] text-uzzai-silver">Jogos</div>
            </Card>
            <Card className="text-center p-3 bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-uzzai-gold">{stats.goals}</div>
              <div className="text-[10px] text-uzzai-silver">Gols</div>
            </Card>
            <Card className="text-center p-3 bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-uzzai-blue">{stats.assists}</div>
              <div className="text-[10px] text-uzzai-silver">Assists</div>
            </Card>
            <Card className="text-center p-3 bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-green-400">{stats.winRate}%</div>
              <div className="text-[10px] text-uzzai-silver">Win</div>
            </Card>
          </div>
        )}

        {/* Atividade Semanal */}
        <Card className="relative border-uzzai-blue/30 bg-white/5 backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-uzzai-blue to-uzzai-mint rounded-t-lg"></div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-uzzai-blue uppercase flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Atividade Semanal
              </CardTitle>
              <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +15%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-16 gap-1">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t transition-all ${
                      index === 4 
                        ? 'bg-uzzai-mint' 
                        : 'bg-uzzai-mint/30'
                    }`}
                    style={{ 
                      height: `${[40, 60, 50, 80, 100, 70, 55][index]}%` 
                    }}
                  ></div>
                  <span className={`text-[8px] mt-1 ${
                    index === 4 ? 'text-uzzai-mint font-bold' : 'text-uzzai-silver'
                  }`}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card className="relative border-purple-500/30 bg-white/5 backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-uzzai-mint rounded-t-lg"></div>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-purple-400 uppercase flex items-center gap-1">
              <Award className="h-3 w-3" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center p-2 bg-uzzai-gold/10 border border-uzzai-gold/30 rounded">
                <Zap className="h-5 w-5 text-uzzai-gold mb-1" />
                <span className="text-[8px] text-uzzai-silver text-center">Streak 5x</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-uzzai-mint/10 border border-uzzai-mint/30 rounded">
                <Award className="h-5 w-5 text-uzzai-mint mb-1" />
                <span className="text-[8px] text-uzzai-silver text-center">Hat-trick</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-uzzai-blue/10 border border-uzzai-blue/30 rounded">
                <Shield className="h-5 w-5 text-uzzai-blue mb-1" />
                <span className="text-[8px] text-uzzai-silver text-center">Muralha</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-white/5 border border-white/10 rounded opacity-40">
                <Lock className="h-5 w-5 text-uzzai-silver mb-1" />
                <span className="text-[8px] text-uzzai-silver text-center">Bloqueado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

