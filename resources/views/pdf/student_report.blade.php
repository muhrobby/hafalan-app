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
                margin: 0;
                padding: 30px 40px;
                font-size: 11px;
                color: #000;
                line-height: 1.4;
            }

            /* Header Kop Sekolah */
            .school-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 3px double #000;
            }

            .school-header .logo {
                width: 60px;
                height: 60px;
                margin: 0 auto 8px;
            }

            .school-header .school-name {
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                margin: 4px 0;
                letter-spacing: 0.5px;
            }

            .school-header .school-address {
                font-size: 10px;
                margin: 2px 0;
            }

            /* Judul Rapor */
            .report-title {
                text-align: center;
                margin: 20px 0 16px;
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                text-decoration: underline;
                letter-spacing: 1px;
            }

            /* Informasi Siswa */
            .student-identity {
                margin: 16px 0 20px;
            }

            .student-identity table {
                width: 100%;
                border-collapse: collapse;
            }

            .student-identity td {
                padding: 3px 0;
                font-size: 11px;
            }

            .student-identity td:nth-child(1) {
                width: 22%;
            }

            .student-identity td:nth-child(2) {
                width: 2%;
            }

            .student-identity td:nth-child(3) {
                width: 26%;
            }

            .student-identity td:nth-child(4) {
                width: 20%;
            }

            .student-identity td:nth-child(5) {
                width: 2%;
            }

            .student-identity td:nth-child(6) {
                width: 28%;
            }

            /* Ringkasan Nilai */
            .score-summary {
                margin: 20px 0;
                padding: 12px;
                background: #f5f5f5;
                border: 1px solid #000;
            }

            .score-summary h3 {
                margin: 0 0 10px;
                font-size: 12px;
                text-align: center;
                font-weight: 700;
                text-transform: uppercase;
            }

            .score-summary table {
                width: 100%;
                border-collapse: collapse;
            }

            .score-summary td {
                padding: 6px;
                border: 1px solid #666;
                text-align: center;
            }

            .score-summary td:first-child {
                text-align: left;
                font-weight: 600;
            }

            .score-summary .value {
                font-size: 16px;
                font-weight: 700;
            }

            /* Tabel Rincian Hafalan */
            table.detail-report {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                font-size: 10px;
            }

            table.detail-report th,
            table.detail-report td {
                padding: 6px 4px;
                border: 1px solid #000;
                vertical-align: top;
            }

            table.detail-report thead th {
                background: #e0e0e0;
                font-weight: 700;
                text-align: center;
                text-transform: uppercase;
                font-size: 9px;
            }

            table.detail-report tbody tr:nth-child(odd) {
                background: #fafafa;
            }

            table.detail-report tbody tr:nth-child(even) {
                background: #fff;
            }

            table.detail-report td.center {
                text-align: center;
            }

            /* Status Badge */
            .status-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: 600;
            }

            .status-murojaah {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }

            .status-selesai {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }

            /* Catatan */
            .notes-section {
                margin: 16px 0;
                padding: 10px;
                border: 1px solid #000;
                min-height: 60px;
            }

            .notes-section h4 {
                margin: 0 0 8px;
                font-size: 11px;
                font-weight: 700;
            }

            .notes-section p {
                margin: 0;
                font-size: 10px;
                font-style: italic;
                color: #666;
            }

            /* Tanda Tangan */
            .signature-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
            }

            .signature-box {
                width: 45%;
                text-align: center;
            }

            .signature-box .date {
                margin-bottom: 8px;
                font-size: 10px;
            }

            .signature-box .role {
                font-size: 11px;
                margin-bottom: 50px;
            }

            .signature-box .name {
                font-weight: 700;
                text-decoration: underline;
                font-size: 11px;
            }

            .signature-box .nip {
                font-size: 9px;
                margin-top: 2px;
            }

            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 40px 20px;
                border: 2px dashed #999;
                margin: 20px 0;
                color: #666;
                font-style: italic;
            }

            /* Footer Info */
            .footer-info {
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px solid #000;
                font-size: 9px;
                text-align: center;
                color: #666;
            }
        </style>
    </head>
    <body>
        <!-- Kop Sekolah -->
        <div class="school-header">
            <div class="school-name">{{ strtoupper(config('app.name', 'Sistem Hafalan')) }}</div>
            <div class="school-address">Jl. Contoh No. 123, Kota, Provinsi 12345</div>
            <div class="school-address">Telp: (021) 1234567 | Email: info@sekolah.ac.id</div>
        </div>

        <!-- Judul Rapor -->
        <div class="report-title">
            Rapor Hafalan Al-Quran
        </div>

        <!-- Identitas Siswa -->
        <section class="student-identity">
            <table>
                <tr>
                    <td>Nama Santri</td>
                    <td>:</td>
                    <td><strong>{{ $student->user->name }}</strong></td>
                    <td>Kelas</td>
                    <td>:</td>
                    <td><strong>{{ $student->class?->name ?? '—' }}</strong></td>
                </tr>
                <tr>
                    <td>NIS</td>
                    <td>:</td>
                    <td>{{ $student->nis ?? '—' }}</td>
                    <td>Wali Kelas</td>
                    <td>:</td>
                    <td>{{ $student->class?->teachers?->first()?->user?->name ?? '—' }}</td>
                </tr>
                <tr>
                    <td>Periode Rapor</td>
                    <td>:</td>
                    <td colspan="4">
                        @if ($period['from'] || $period['to'])
                            {{ $period['from'] ? \Illuminate\Support\Carbon::parse($period['from'])->translatedFormat('d F Y') : '∼' }}
                            s.d.
                            {{ $period['to'] ? \Illuminate\Support\Carbon::parse($period['to'])->translatedFormat('d F Y') : '∼' }}
                        @else
                            Semua periode
                        @endif
                    </td>
                </tr>
            </table>
        </section>

        <!-- Ringkasan Capaian -->
        <section class="score-summary">
            <h3>Ringkasan Capaian Hafalan</h3>
            <table>
                <tr>
                    <td>Total Setoran (Ayat)</td>
                    <td class="value">{{ number_format($summary['totalSetoran']) }}</td>
                    <td>Total Murojaah</td>
                    <td class="value">{{ number_format($summary['totalMurojaah']) }}</td>
                    <td>Total Selesai</td>
                    <td class="value">{{ number_format($summary['totalSelesai']) }}</td>
                </tr>
            </table>
        </section>

        <!-- Rincian Setoran Hafalan -->
        @if ($hafalan->isEmpty())
            <div class="empty-state">
                Belum ada data setoran hafalan untuk periode ini.
            </div>
        @else
            <table class="detail-report">
                <thead>
                    <tr>
                        <th style="width: 4%;">No</th>
                        <th style="width: 12%;">Tanggal</th>
                        <th style="width: 22%;">Surah</th>
                        <th style="width: 8%;">Ayat</th>
                        <th style="width: 12%;">Status</th>
                        <th style="width: 18%;">Ustadz/Ustadzah</th>
                        <th>Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($hafalan as $index => $entry)
                        <tr>
                            <td class="center">{{ $index + 1 }}</td>
                            <td class="center">{{ $entry->date->translatedFormat('d/m/Y') }}</td>
                            <td>{{ $entry->surah?->code }}. {{ $entry->surah?->name }}</td>
                            <td class="center">{{ $entry->from_ayah }}</td>
                            <td class="center">
                                @if ($entry->status === 'murojaah')
                                    <span class="status-badge status-murojaah">Murojaah</span>
                                @else
                                    <span class="status-badge status-selesai">Selesai</span>
                                @endif
                            </td>
                            <td>{{ $entry->teacher?->user?->name ?? '—' }}</td>
                            <td>{{ $entry->notes ?? '—' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        <!-- Catatan Ustadz -->
        <section class="notes-section">
            <h4>Catatan Wali Kelas:</h4>
            <p>
                @if ($hafalan->isNotEmpty())
                    {{ $student->user->name }} telah menyelesaikan {{ number_format($summary['totalSelesai']) }} ayat dengan lancar 
                    dan perlu mengulang {{ number_format($summary['totalMurojaah']) }} ayat. Tetap semangat menghafal!
                @else
                    -
                @endif
            </p>
        </section>

        <!-- Tanda Tangan -->
        <section class="signature-section">
            <div class="signature-box">
                <div class="date">
                    {{ $generatedAt->translatedFormat('d F Y') }}
                </div>
                <div class="role">Wali Kelas</div>
                <div class="name">{{ $student->class?->teachers?->first()?->user?->name ?? '—' }}</div>
                <div class="nip">NIP: {{ $student->class?->teachers?->first()?->nip ?? '—' }}</div>
            </div>
            <div class="signature-box">
                <div class="date">
                    {{ $generatedAt->translatedFormat('d F Y') }}
                </div>
                <div class="role">Kepala Sekolah</div>
                <div class="name">{{ $schoolHeadName }}</div>
                <div class="nip">NIP: -</div>
            </div>
        </section>

        <!-- Footer -->
        <div class="footer-info">
            Dicetak oleh: {{ auth()->user()?->name ?? 'Sistem' }} pada {{ $generatedAt->translatedFormat('d F Y, H:i') }} WIB
        </div>
    </body>
</html>
