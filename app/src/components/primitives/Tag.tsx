import type { CSSProperties, ReactNode } from 'react';

interface TagProps {
  variant?: 'accent' | 'accent-2' | 'neutral' | 'outline';
  style?: CSSProperties;
  children: ReactNode;
}

export function Tag({ variant = 'neutral', style, children }: TagProps) {
  return (
    <span className={`tag tag-${variant}`} style={style}>
      {children}
    </span>
  );
}
