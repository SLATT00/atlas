import { clsx } from 'clsx';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-label',
    md: 'w-10 h-10 text-secondary',
    lg: 'w-14 h-14 text-body',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover', sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-atlas-accent/20 text-atlas-accent flex items-center justify-center font-semibold',
        sizeClasses[size]
      )}
    >
      {initials}
    </div>
  );
}
