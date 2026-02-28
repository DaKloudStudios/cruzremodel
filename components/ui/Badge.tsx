import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    className = '',
    variant = 'default',
    size = 'md',
    pulse = false,
    children,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-full border transition-colors';

    const sizes = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1'
    };

    const variants: Record<BadgeVariant, string> = {
        default: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-orange-50 text-orange-700 border-orange-200',
        error: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-slate-50 text-slate-600 border-slate-200'
    };

    return (
        <span className={`relative ${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
            {pulse && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variants[variant].split(' ')[0]}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${variants[variant].split(' ')[1]}`}></span>
                </span>
            )}
            {children}
        </span>
    );
};
