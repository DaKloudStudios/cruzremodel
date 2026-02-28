import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = '2xl'
}) => {
    if (!isOpen) return null;

    const maxWidthClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        'full': 'max-w-[95vw]'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={`
        relative w-full ${maxWidthClasses[maxWidth]} 
        bg-white rounded-[2rem] shadow-2xl border border-white/50 
        overflow-hidden flex flex-col max-h-[90vh]
        animate-in zoom-in-95 fade-in duration-200
      `}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-cream-100 flex justify-between items-center bg-cream-50/50">
                    <h2 className="text-xl font-bold font-display text-charcoal">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-charcoal hover:bg-white rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-cream-100 bg-cream-50/50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
