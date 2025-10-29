import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export type User = {
    id: number;
    name: string;
    email: string;
    role: string | null;
};

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue<string>('role');

            switch (role) {
                case 'admin':
                    return (
                        <Badge className="border border-red-200 bg-red-500/15 text-red-600 uppercase">
                            {role}
                        </Badge>
                    );
                case 'teacher':
                    return (
                        <Badge className="border border-blue-200 bg-blue-500/15 text-blue-600 uppercase">
                            {role}
                        </Badge>
                    );
                case 'student':
                    return (
                        <Badge className="border border-green-200 bg-green-500/15 text-green-600 uppercase">
                            {role}
                        </Badge>
                    );
                case 'wali':
                    return (
                        <Badge className="border border-yellow-200 bg-yellow-500/15 text-yellow-600 uppercase">
                            {role}
                        </Badge>
                    );

                default:
                    return (
                        <Badge className="border border-gray-200 bg-gray-100 text-gray-700 uppercase">
                            {role ?? '-'}
                        </Badge>
                    );
            }
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const user = row.original;

            return (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        const confirmed = window.confirm(
                            `Atur password sementara untuk ${user.name}?`,
                        );

                        if (!confirmed) {
                            return;
                        }

                        router.post(
                            '/admin/password/temp',
                            {
                                user_id: user.id,
                            },
                            {
                                preserveScroll: true,
                            },
                        );
                    }}
                >
                    Reset Password
                </Button>
            );
        },
    },
];
