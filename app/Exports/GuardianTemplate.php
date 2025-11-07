<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class GuardianTemplate implements FromArray, WithHeadings, WithStyles, WithColumnWidths
{
    /**
     * Return example data
     */
    public function array(): array
    {
        return [
            [
                'Budi Santoso',
                'budi.santoso@example.com',
                '081234567890',
                'Jl. Keluarga No. 10, Jakarta',
            ],
            [
                'Siti Aminah',
                'siti.aminah@example.com',
                '081234567891',
                'Jl. Orang Tua No. 25, Bandung',
            ],
            [
                'Ahmad Rahman',
                'ahmad.rahman@example.com',
                '081234567892',
                'Jl. Wali Murid No. 5, Surabaya',
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
            'address',
        ];
    }

    /**
     * Apply styles to the sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Style header row
        $sheet->getStyle('A1:D1')->applyFromArray([
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
        $sheet->getStyle('A1:D1')->getAlignment()->setHorizontal('center');

        // Add borders
        $sheet->getStyle('A1:D4')->applyFromArray([
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
            'D' => 40, // address
        ];
    }
}
