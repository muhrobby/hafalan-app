<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class TeacherTemplate implements FromArray, WithHeadings, WithStyles, WithColumnWidths
{
    /**
     * Return example data
     */
    public function array(): array
    {
        return [
            [
                'Ahmad Fauzan',
                'ahmad.fauzan@example.com',
                '081234567890',
                '1990-05-15',
                'Jl. Pendidikan No. 15, Jakarta',
            ],
            [
                'Siti Nurhaliza',
                'siti.nurhaliza@example.com',
                '081234567891',
                '1985-08-20',
                'Jl. Guru No. 20, Bandung',
            ],
            [
                'Budi Prasetyo',
                'budi.prasetyo@example.com',
                '081234567892',
                '1988-03-10',
                'Jl. Ilmu No. 10, Surabaya',
            ],
        ];
    }

    /**
     * Column headings
     */
    public function headings(): array
    {
        return [
            'name',
            'email',
            'phone',
            'birth_date',
            'address',
        ];
    }

    /**
     * Apply styles to the sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Style header row
        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2d5f3f'], // Green from logo
            ],
        ]);

        // Center align headers
        $sheet->getStyle('A1:E1')->getAlignment()->setHorizontal('center');

        // Add borders
        $sheet->getStyle('A1:E4')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ]);

        return [];
    }

    /**
     * Set column widths
     */
    public function columnWidths(): array
    {
        return [
            'A' => 25, // name
            'B' => 30, // email
            'C' => 18, // phone
            'D' => 15, // birth_date
            'E' => 40, // address
        ];
    }
}
