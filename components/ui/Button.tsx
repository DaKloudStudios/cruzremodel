import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = '',
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center font-bold font-display rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-forest-900 hover:bg-forest-800 text-white shadow-sm hover:shadow-md active:scale-[0.98]',
            secondary: 'bg-cream-100 hover:bg-cream-200 text-charcoal shadow-sm hover:shadow-md active:scale-[0.98]',
            outline: 'border-2 border-slate-200 hover:border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:scale-[0.98]',
            danger: 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 active:scale-[0.98]',
            ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-charcoal'
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs gap-1.5',
            md: 'px-4 py-2 text-sm gap-2',
            lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl'
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!isLoading && leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';
