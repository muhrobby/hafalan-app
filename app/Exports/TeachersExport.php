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

class TeachersExport implements 
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
            ->whereNotNull('nip')
            ->with(['user:id,name,email', 'classes']);

        // Apply filters
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['has_class'])) {
            if ($this->filters['has_class'] === 'true' || $this->filters['has_class'] === true) {
                $query->has('classes');
            } elseif ($this->filters['has_class'] === 'false' || $this->filters['has_class'] === false) {
                $query->doesntHave('classes');
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
            'NIP',
            'No. Telepon',
            'Tanggal Lahir',
            'Kelas yang Diajar',
            'Jumlah Kelas',
            'Tanggal Dibuat',
        ];
    }

    public function map($teacher): array
    {
        static $rowNumber = 0;
        $rowNumber++;

        $classNames = $teacher->classes->pluck('name')->join(', ');

        return [
            $rowNumber,
            $teacher->user->name,
            $teacher->user->email,
            $teacher->nip,
            $teacher->phone ?? '-',
            $teacher->birth_date ? $teacher->birth_date->format('d/m/Y') : '-',
            $classNames ?: '-',
            $teacher->classes->count(),
            $teacher->created_at->format('d/m/Y H:i'),
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
            'D' => 18,
            'E' => 15,
            'F' => 15,
            'G' => 40,
            'H' => 15,
            'I' => 18,
        ];
    }

    public function title(): string
    {
        return 'Data Guru';
    }
}
