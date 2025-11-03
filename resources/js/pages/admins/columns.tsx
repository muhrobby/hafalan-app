import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, Trash2Icon, KeyRound } from 'lucide-react';

export type AdminRow = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
};

type BuildColumnsParams = {
    canManage: boolean;
    onEdit: (admin: AdminRow) => void;
    onDelete: (admin: AdminRow) => void;
    onResetPassword: (admin: AdminRow) => void;
};

export function buildAdminColumns({
    canManage,
    onEdit,
    onDelete,
    onResetPassword,
}: BuildColumnsParams): ColumnDef<AdminRow>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama & Kontak',
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.email}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Dibuat',
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span>{new Date(row.original.created_at).toLocaleDateString('id-ID')}</span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.created_at_human}
                    </span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: canManage ? 'Aksi' : undefined,
            enableSorting: false,
            cell: ({ row }) => {
                if (!canManage) return null;
                const admin = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(admin)}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onResetPassword(admin)}
                        >
                            <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(admin)}
                        >
                            <Trash2Icon className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}
