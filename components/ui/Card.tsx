import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', glass = false, hover = false, children, ...props }, ref) => {
        // Premium default styles
        const baseStyles = 'rounded-[2rem] border overflow-hidden transition-all duration-300';

        // Glassmorphism vs Solid
        const visualStyles = glass
            ? 'bg-white/80 backdrop-blur-xl border-white/50 shadow-soft'
            : 'bg-white border-cream-100 shadow-sm';

        // Hover effects
        const hoverStyles = hover
            ? 'hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5'
            : '';

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${visualStyles} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Optonal sub-components for consistent internal structure
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`px-6 py-5 border-b border-cream-100/50 bg-cream-50/30 w-full ${className}`} {...props}>
            {children}
        </div>
    )
);
CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`p-6 w-full ${className}`} {...props}>
            {children}
        </div>
    )
);
CardContent.displayName = 'CardContent';
