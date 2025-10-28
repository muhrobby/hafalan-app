import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, Trash2Icon, KeyRound } from 'lucide-react';

export type TeacherRow = {
    id: number;
    user_id: number;
    name: string;
    email: string;
    nip: string;
    phone?: string | null;
    birth_date?: string | null;
    classes_count: number;
    class_names?: string[];
    class_ids?: number[];
    created_at: string;
    updated_at: string;
    created_at_human: string;
    updated_at_human: string;
};

type BuildColumnsParams = {
    canManage: boolean;
    onEdit: (teacher: TeacherRow) => void;
    onDelete: (teacher: TeacherRow) => void;
    onResetPassword: (teacher: TeacherRow) => void;
};

export function buildTeacherColumns({
    canManage,
    onEdit,
    onDelete,
    onResetPassword,
}: BuildColumnsParams): ColumnDef<TeacherRow>[] {
    return [
        {
            accessorKey: 'name',
            header: 'Nama',
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
            accessorKey: 'nip',
            header: 'NIP',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.nip}</span>
            ),
        },
        {
            accessorKey: 'phone',
            header: 'No. Telepon',
            cell: ({ row }) => row.original.phone ?? '-',
        },
        {
            accessorKey: 'class_names',
            header: 'Kelas yang Diajar',
            cell: ({ row }) => {
                const names = row.original.class_names || [];
                if (names.length === 0) {
                    return <span className="text-muted-foreground">Belum ada</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {names.slice(0, 2).map((name) => (
                            <Badge key={name} variant="secondary">
                                {name}
                            </Badge>
                        ))}
                        {names.length > 2 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Badge 
                                        variant="outline" 
                                        className="cursor-pointer hover:bg-accent"
                                    >
                                        +{names.length - 2} lagi
                                    </Badge>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="start">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Semua Kelas ({names.length})</h4>
                                        <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto">
                                            {names.map((name) => (
                                                <Badge key={name} variant="secondary">
                                                    {name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Dibuat',
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
            cell: ({ row }) => {
                if (!canManage) return null;
                const teacher = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(teacher)}
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onResetPassword(teacher)}
                            title="Reset Password"
                        >
                            <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(teacher)}
                        >
                            <Trash2Icon className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}
