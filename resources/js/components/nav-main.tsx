import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const isActiveUrl = (currentUrl: string, href?: string) => {
    if (! href) {
        return false;
    }

    return currentUrl.startsWith(href);
};

const renderIcon = (Icon?: NavItem['icon']) =>
    Icon ? <Icon className="size-4" /> : null;

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { url } = usePage();
    const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

    const renderItem = (item: NavItem) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        if (! hasChildren) {
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild={Boolean(item.href)}
                        isActive={isActiveUrl(url, typeof item.href === 'string' ? item.href : undefined)}
                        tooltip={{ children: item.title }}
                    >
                        {item.href ? (
                            <Link href={item.href} prefetch>
                                {renderIcon(item.icon)}
                                <span>{item.title}</span>
                            </Link>
                        ) : (
                            <span className="flex w-full items-center gap-2">
                                {renderIcon(item.icon)}
                                <span>{item.title}</span>
                            </span>
                        )}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }

        const isAnyChildActive = item.children?.some((child) =>
            isActiveUrl(url, child.href as string | undefined),
        );
        const isOpen = openMap[item.title] ?? isAnyChildActive ?? false;

        const toggleOpen = () =>
            setOpenMap((prev) => ({
                ...prev,
                [item.title]: ! isOpen,
            }));

        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                    isActive={isAnyChildActive}
                    onClick={toggleOpen}
                    aria-expanded={isOpen}
                >
                    <div className="flex w-full items-center justify-between">
                        <span className="flex items-center gap-2">
                            {renderIcon(item.icon)}
                            <span>{item.title}</span>
                        </span>
                        <ChevronDown
                            className={cn('size-3.5 opacity-60 transition-transform', {
                                'rotate-180': isOpen,
                            })}
                        />
                    </div>
                </SidebarMenuButton>
                <SidebarMenuSub className={cn(! isOpen && 'hidden')}>
                    {item.children?.map((child) => (
                        <SidebarMenuSubItem key={child.title}>
                            <SidebarMenuSubButton
                                asChild
                                isActive={isActiveUrl(url, child.href as string | undefined)}
                            >
                                <Link href={child.href ?? '#'} prefetch>
                                    {renderIcon(child.icon)}
                                    <span>{child.title}</span>
                                </Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
            </SidebarMenuItem>
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>{items.map((item) => renderItem(item))}</SidebarMenu>
        </SidebarGroup>
    );
}
