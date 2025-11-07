<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;

class StudentGuardianTemplate implements FromArray, WithHeadings, WithStyles, WithColumnWidths
{
    /**
     * Return example data
     */
    public function array(): array
    {
        return [
            [
                'Ahmad Fauzi',
                '2010-01-15',
                '081234567890',
                'Jl. Merdeka No. 10',
                'Budi Santoso',
                'budi.santoso@example.com',
                '081234567891',
                'Jl. Merdeka No. 10',
            ],
            [
                'Fatimah Zahra',
                '2011-05-20',
                '081234567892',
                'Jl. Sudirman No. 25',
                'Siti Aminah',
                'siti.aminah@example.com',
                '081234567893',
                'Jl. Sudirman No. 25',
            ],
        ];
    }

    /**
     * Column headings
     */
    public function headings(): array
    {
        return [
            'nama_santri',
            'tanggal_lahir',
            'telepon_santri',
            'alamat_santri',
            'nama_wali',
            'email_wali',
            'telepon_wali',
            'alamat_wali',
        ];
    }

    /**
     * Apply styles to the sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Style header row (A to H, not J anymore)
        $sheet->getStyle('A1:H1')->applyFromArray([
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
        $sheet->getStyle('A1:H1')->getAlignment()->setHorizontal('center');

        // Add borders
        $sheet->getStyle('A1:H3')->applyFromArray([
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
            'A' => 20, // nama_santri
            'B' => 15, // tanggal_lahir
            'C' => 15, // telepon_santri
            'D' => 30, // alamat_santri
            'E' => 20, // nama_wali
            'F' => 25, // email_wali
            'G' => 15, // telepon_wali
            'H' => 30, // alamat_wali
        ];
    }
}
