<?php

namespace App\Exports;

use App\Models\Profile;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Database\Eloquent\Builder;

class GuardiansExport implements 
    FromQuery, 
    WithHeadings, 
    WithMapping, 
    WithStyles,
    WithTitle,
    WithColumnWidths,
    ShouldAutoSize
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $query = Profile::query()
            ->whereHas('user', fn($q) => $q->role('wali'))
            ->with(['user:id,name,email', 'students.user:id,name']);

        // Apply filters
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['has_student'])) {
            if ($this->filters['has_student'] === 'true' || $this->filters['has_student'] === true) {
                $query->has('students');
            } elseif ($this->filters['has_student'] === 'false' || $this->filters['has_student'] === false) {
                $query->doesntHave('students');
            }
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'Email',
            'No. Telepon',
            'Alamat',
            'Santri yang Diasuh',
            'Jumlah Santri',
            'Tanggal Dibuat',
        ];
    }

    public function map($guardian): array
    {
        static $rowNumber = 0;
        $rowNumber++;

        $studentNames = $guardian->students->pluck('user.name')->join(', ');

        return [
            $rowNumber,
            $guardian->user->name,
            $guardian->user->email,
            $guardian->phone ?? '-',
            $guardian->address ?? '-',
            $studentNames ?: '-',
            $guardian->students->count(),
            $guardian->created_at->format('d/m/Y H:i'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E2E8F0']
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 25,
            'C' => 30,
            'D' => 15,
            'E' => 35,
            'F' => 40,
            'G' => 15,
            'H' => 18,
        ];
    }

    public function title(): string
    {
        return 'Data Wali';
    }
}
