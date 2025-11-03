import type { LucideIcon } from 'lucide-react';
import {
    BarChart3,
    BookOpen,
    ClipboardList,
    GraduationCap,
    LayoutGrid,
    Shield,
    User2Icon,
    UserRound,
    Users,
} from 'lucide-react';

import type { NavItem } from '@/types';

export type MenuDefinition = {
    title: string;
    href?: string;
    icon?: LucideIcon;
    roles: string[];
    children?: MenuDefinition[];
};

const ALL_ROLES = ['*'];

export const MENU_TREE: MenuDefinition[] = [
    {
        title: 'Beranda',
        href: '/dashboard',
        icon: LayoutGrid,
        roles: ALL_ROLES,
    },
    {
        title: 'Akademik',
        icon: GraduationCap,
        roles: ['admin', 'teacher', 'guardian', 'wali', 'student'],
        children: [
            {
                title: 'Hafalan',
                href: '/hafalan',
                icon: BookOpen,
                roles: ['admin', 'teacher'],
            },
            {
                title: 'Rangkuman Nilai',
                href: '/akademik/rekap-nilai',
                icon: ClipboardList,
                roles: ['admin', 'teacher', 'guardian', 'wali', 'student'],
            },
            {
                title: 'Analitik',
                href: '/analytics',
                icon: BarChart3,
                roles: ['admin'],
            },
        ],
    },
    {
        title: 'Manajemen Pengguna',
        icon: Users,
        roles: ['admin'], // Only admin can see management menu
        children: [
            {
                title: 'Admin',
                href: '/admins',
                icon: Shield,
                roles: ['admin'],
            },
            {
                title: 'Guru',
                href: '/teachers',
                icon: UserRound,
                roles: ['admin'],
            },
            {
                title: 'Santri',
                href: '/students',
                icon: GraduationCap,
                roles: ['admin'], // Only admin can manage students
            },
            {
                title: 'Wali',
                href: '/guardians',
                icon: User2Icon,
                roles: ['admin'],
            },
        ],
    },
];

export const filterMenuByRoles = (
    nodes: MenuDefinition[],
    roles: string[],
): NavItem[] => {
    const hasRole = (allowed: string[]) => {
        if (allowed.includes('*')) {
            return true;
        }

        if (roles.length === 0) {
            return false;
        }

        return allowed.some((role) => roles.includes(role));
    };

    const recurse = (items: MenuDefinition[]): NavItem[] =>
        items
            .map((item) => {
                if (!hasRole(item.roles)) {
                    return null;
                }

                const children = item.children ? recurse(item.children) : [];

                return {
                    title: item.title,
                    href: item.href,
                    icon: item.icon,
                    children,
                };
            })
            .filter((item): item is NavItem => {
                if (!item) {
                    return false;
                }

                if (item.children && item.children.length === 0 && !item.href) {
                    return false;
                }

                return true;
            });

    return recurse(nodes);
};
