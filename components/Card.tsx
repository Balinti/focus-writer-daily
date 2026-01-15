'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg',
      bordered: 'bg-white border border-gray-200',
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-6 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
