<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Facades\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AdminsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle, WithColumnWidths, ShouldAutoSize
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = User::query()
            ->with('roles')
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'));

        // Apply search filter
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('id');
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Email',
            'Tanggal Dibuat',
        ];
    }

    public function map($user): array
    {
        static $number = 0;
        $number++;

        return [
            $number,
            $user->name,
            $user->email,
            $user->created_at ? $user->created_at->format('d/m/Y') : '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Data Admin';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 30,
            'C' => 35,
            'D' => 20,
        ];
    }
}
