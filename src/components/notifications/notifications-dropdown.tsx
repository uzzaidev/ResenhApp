'use client';

import { useState } from 'react';
import { Bell, Check, Calendar, DollarSign, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'training' | 'payment' | 'game' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications - será substituído por dados reais
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'training',
    title: 'Novo Treino',
    message: 'Treino de Futsal marcado para Terça-feira, 20:00',
    time: 'há 2 horas',
    read: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Pagamento Pendente',
    message: 'Você tem R$ 10,00 pendente do treino de 15/01',
    time: 'há 5 horas',
    read: false,
  },
  {
    id: '3',
    type: 'game',
    title: 'Convocação',
    message: 'Você foi convocado para o jogo contra UFRGS',
    time: 'há 1 dia',
    read: false,
  },
  {
    id: '4',
    type: 'general',
    title: 'Nova Modalidade',
    message: 'Basquete foi adicionado às modalidades ativas',
    time: 'há 2 dias',
    read: true,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'training':
      return Calendar;
    case 'payment':
      return DollarSign;
    case 'game':
      return Trophy;
    default:
      return Users;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'training':
      return 'text-teal-500';
    case 'payment':
      return 'text-yellow-500';
    case 'game':
      return 'text-purple-500';
    default:
      return 'text-blue-500';
  }
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
          {notifications.length === 0 ? (
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
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      'w-full text-left p-4 hover:bg-gray-800/50 transition-colors',
                      !notification.read && 'bg-gray-800/30'
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
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-teal-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
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
