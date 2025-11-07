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

class StudentsExport implements 
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
            ->whereNotNull('nis')
            ->with(['user:id,name,email', 'guardians.user:id,name']); // DEPRECATED: 'class:id,name' removed

        // Apply filters
        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('nis', 'like', "%{$search}%");
            });
        }

        // DEPRECATED: Class filtering removed
        // if (!empty($this->filters['class_id'])) {
        //     $query->where('class_id', $this->filters['class_id']);
        // }

        if (isset($this->filters['has_guardian'])) {
            if ($this->filters['has_guardian'] === 'true' || $this->filters['has_guardian'] === true) {
                $query->has('guardians');
            } elseif ($this->filters['has_guardian'] === 'false' || $this->filters['has_guardian'] === false) {
                $query->doesntHave('guardians');
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
            'NIS',
            'Kelas',
            'No. Telepon',
            'Tanggal Lahir',
            'Wali',
            'Jumlah Wali',
            'Tanggal Dibuat',
        ];
    }

    public function map($student): array
    {
        static $rowNumber = 0;
        $rowNumber++;

        $guardianNames = $student->guardians->pluck('user.name')->join(', ');

        return [
            $rowNumber,
            $student->user->name,
            $student->user->email,
            $student->nis,
            '-', // DEPRECATED: Class system removed
            $student->phone ?? '-',
            $student->birth_date ? $student->birth_date->format('d/m/Y') : '-',
            $guardianNames ?: '-',
            $student->guardians->count(),
            $student->created_at->format('d/m/Y H:i'),
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
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 40,
            'I' => 12,
            'J' => 18,
        ];
    }

    public function title(): string
    {
        return 'Data Santri';
    }
}
