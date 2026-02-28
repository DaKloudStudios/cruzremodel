import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, icon }) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="p-2.5 bg-emerald-500 rounded-2xl text-charcoal shadow-sm">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-charcoal tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
};
