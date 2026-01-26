'use client';

import { Bell, Calendar, DollarSign, Trophy, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNotifications, type Notification } from '@/hooks/use-notifications';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getNotificationIcon = (type: string) => {
  // Mapear tipos do banco para ícones
  if (type.includes('event') || type.includes('training') || type.includes('rsvp')) {
    return Calendar;
  }
  if (type.includes('payment') || type.includes('charge')) {
    return DollarSign;
  }
  if (type.includes('game') || type.includes('team') || type.includes('achievement')) {
    return Trophy;
  }
  return Users;
};

const getNotificationColor = (type: string) => {
  if (type.includes('event') || type.includes('training') || type.includes('rsvp')) {
    return 'text-teal-500';
  }
  if (type.includes('payment') || type.includes('charge')) {
    return 'text-yellow-500';
  }
  if (type.includes('game') || type.includes('team') || type.includes('achievement')) {
    return 'text-purple-500';
  }
  return 'text-blue-500';
};

const formatNotificationTime = (createdAt: string) => {
  try {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return 'há pouco tempo';
  }
};

export function NotificationsDropdown() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(30000, true); // Polling a cada 30s

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navegar para action_url se existir
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1 px-2"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-400">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-400">Nenhuma notificação</p>
              <p className="text-xs text-gray-500 mt-1">Você está em dia!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'w-full text-left p-4 hover:bg-gray-800/50 transition-colors',
                      !notification.is_read && 'bg-gray-800/30'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn('p-2 rounded-lg bg-gray-800 flex-shrink-0', iconColor)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold truncate">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-teal-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatNotificationTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-800">
            <Button variant="ghost" className="w-full text-xs h-8" size="sm">
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
