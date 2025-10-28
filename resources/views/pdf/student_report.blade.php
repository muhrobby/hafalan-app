<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <title>Rapor Hafalan {{ $student->user->name }}</title>
        <style>
            * {
                box-sizing: border-box;
                font-family: 'DejaVu Sans', Arial, sans-serif;
            }

            body {
                margin: 24px;
                font-size: 12px;
                color: #1f2933;
            }

            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                border-bottom: 2px solid #4b5563;
                padding-bottom: 12px;
            }

            header .title {
                font-size: 20px;
                font-weight: 700;
                text-transform: uppercase;
                color: #111827;
            }

            .student-info {
                margin-bottom: 16px;
            }

            .student-info table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 8px;
            }

            .student-info td {
                padding: 4px 0;
            }

            .summary {
                display: flex;
                gap: 16px;
                margin: 16px 0;
            }

            .summary-card {
                flex: 1;
                background: #f3f4f6;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
            }

            .summary-card h3 {
                margin: 0;
                font-size: 12px;
                text-transform: uppercase;
                color: #6b7280;
                letter-spacing: 0.05em;
            }

            .summary-card p {
                margin: 4px 0 0;
                font-size: 18px;
                font-weight: 700;
                color: #111827;
            }

            table.report {
                width: 100%;
                border-collapse: collapse;
                margin-top: 16px;
            }

            table.report thead {
                background: #1f2937;
                color: #f9fafb;
            }

            table.report th,
            table.report td {
                padding: 8px;
                border: 1px solid #d1d5db;
                text-align: left;
                vertical-align: top;
            }

                table.report tbody tr:nth-child(even) {
                background: #f9fafb;
            }

            .empty-state {
                text-align: center;
                padding: 32px;
                border: 1px dashed #d1d5db;
                border-radius: 8px;
                margin-top: 16px;
                color: #6b7280;
                font-style: italic;
            }

            footer {
                margin-top: 32px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <header>
            <div>
                <div class="title">{{ strtoupper(config('app.name')) }}</div>
                <div>Rapor Hafalan Santri</div>
            </div>
            <div style="text-align: right;">
                <div><strong>Tanggal Cetak:</strong> {{ $generatedAt->translatedFormat('d F Y') }}</div>
                @if ($period['from'] || $period['to'])
                    <div>
                        Periode:
                        {{ $period['from'] ? \Illuminate\Support\Carbon::parse($period['from'])->translatedFormat('d M Y') : '∼' }}
                        -
                        {{ $period['to'] ? \Illuminate\Support\Carbon::parse($period['to'])->translatedFormat('d M Y') : '∼' }}
                    </div>
                @endif
            </div>
        </header>

        <section class="student-info">
            <table>
                <tr>
                    <td><strong>Nama Santri</strong></td>
                    <td>: {{ $student->user->name }}</td>
                    <td><strong>Kelas</strong></td>
                    <td>: {{ $student->class?->name ?? '—' }}</td>
                </tr>
                <tr>
                    <td><strong>NIS</strong></td>
                    <td>: {{ $student->nis ?? '—' }}</td>
                    <td><strong>Wali Kelas</strong></td>
                    <td>: {{ $student->class?->teacher?->user?->name ?? '—' }}</td>
                </tr>
            </table>
        </section>

        <section class="summary">
            <div class="summary-card">
                <h3>Total Setoran</h3>
                <p>{{ number_format($summary['totalSetoran']) }}</p>
            </div>
            <div class="summary-card">
                <h3>Total Murojaah</h3>
                <p>{{ number_format($summary['totalMurojaah']) }}</p>
            </div>
            <div class="summary-card">
                <h3>Total Selesai</h3>
                <p>{{ number_format($summary['totalSelesai']) }}</p>
            </div>
        </section>

        @if ($hafalan->isEmpty())
            <div class="empty-state">Belum ada data hafalan untuk periode ini.</div>
        @else
            <table class="report">
                <thead>
                    <tr>
                        <th style="width: 14%;">Tanggal</th>
                        <th style="width: 24%;">Surat</th>
                        <th style="width: 12%;">Ayat</th>
                        <th style="width: 12%;">Status</th>
                        <th style="width: 18%;">Ustadz</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($hafalan as $entry)
                        <tr>
                            <td>{{ $entry->date->translatedFormat('d M Y') }}</td>
                            <td>{{ $entry->surah?->code }}. {{ $entry->surah?->name }}</td>
                            <td>{{ $entry->from_ayah }}</td>
                            <td>
                                @php
                                    $statusMap = [
                                        'murojaah' => ['Murojaah', '#ef4444'],
                                        'selesai' => ['Selesai', '#16a34a'],
                                    ];
                                    [$label, $color] = $statusMap[$entry->status] ?? [$entry->status, '#6b7280'];
                                @endphp
                                <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;color:#fff;background:{{ $color }};">
                                    {{ $label }}
                                </span>
                            </td>
                            <td>{{ $entry->teacher?->user?->name ?? '—' }}</td>
                            <td>{{ $entry->notes ?? '—' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        <footer>
            <div>
                <div><strong>Dicetak oleh:</strong></div>
                <div>{{ auth()->user()?->name ?? 'Sistem' }}</div>
            </div>
            <div style="text-align: right;">
                <div>Mengetahui,</div>
                <div style="margin-top: 48px; font-weight: 600;">
                    {{ $schoolHeadName }}
                </div>
                <div>Kepala Sekolah</div>
            </div>
        </footer>
    </body>
</html>
