import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={`flex flex-col gap-1.5 w-full ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                        {label}
                    </label>
                )}
                <div className="relative flex items-center w-full">
                    {leftIcon && (
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full bg-cream-50/50 border border-slate-200 text-charcoal text-sm rounded-xl
              focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all duration-300
              placeholder:text-slate-400 font-medium
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${error ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20' : ''}
              py-2.5
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-[10px] text-red-500 font-medium ml-1 mt-0.5">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
