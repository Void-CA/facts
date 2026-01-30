import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, children }) => {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-border pb-8">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-surface border border-border rounded-2xl shadow-sm">
                    <Icon size={32} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight">{title}</h1>
                    <p className="text-text-muted text-lg">{description}</p>
                </div>
            </div>
            {children && (
                <div className="flex gap-3">
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
