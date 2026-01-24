import { cn } from '@/lib/utils';

interface ModalityIconProps {
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-base',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-16 w-16 text-3xl',
  xl: 'h-24 w-24 text-5xl',
};

export function ModalityIcon({
  icon = '⚽',
  color = '#10b981',
  size = 'md',
  className,
}: ModalityIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span className="leading-none">{icon}</span>
    </div>
  );
}
