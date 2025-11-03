import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as React from 'react';

type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'default';

const BADGE_STYLES: Record<BadgeVariant, string> = {
    success:
        'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow',
    warning:
        'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow',
    default:
        'bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow',
};

interface ColorfulBadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

export function ColorfulBadge({
    variant = 'default',
    children,
    className,
}: ColorfulBadgeProps) {
    return (
        <Badge className={cn(BADGE_STYLES[variant], className)}>
            {children}
        </Badge>
    );
}
