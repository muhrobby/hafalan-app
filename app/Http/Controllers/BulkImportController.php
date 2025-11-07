<?php

namespace App\Http\Controllers;

use App\Imports\StudentGuardianImport;
use App\Imports\TeacherImport;
use App\Imports\GuardianImport;
use App\Exports\StudentGuardianTemplate;
use App\Exports\TeacherTemplate;
use App\Exports\GuardianTemplate;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class BulkImportController extends Controller
{
    /**
     * Download template Excel for Student+Guardian import
     */
    public function downloadStudentGuardianTemplate()
    {
        return Excel::download(
            new StudentGuardianTemplate(),
            'template_santri_wali.xlsx'
        );
    }

    /**
     * Import students with their guardians from Excel
     */
    public function importStudentGuardian(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120', // 5MB max
        ]);

        try {
            $import = new StudentGuardianImport();
            Excel::import($import, $request->file('file'));

            // Check if there were any validation failures
            $failures = $import->failures();

            if ($failures->isNotEmpty()) {
                $errors = [];
                foreach ($failures as $failure) {
                    $errors[] = [
                        'row' => $failure->row(),
                        'attribute' => $failure->attribute(),
                        'errors' => $failure->errors(),
                        'values' => $failure->values(),
                    ];
                }

                return back()->with([
                    'error' => 'Beberapa data gagal diimport. Silakan periksa kembali file Excel Anda.',
                    'failures' => $errors,
                    'flashId' => uniqid(),
                ]);
            }

            return back()->with([
                'success' => 'Data santri dan wali berhasil diimport!',
                'flashId' => uniqid(),
            ]);

        } catch (\Exception $e) {
            Log::error('Import failed: ' . $e->getMessage());

            return back()->with([
                'error' => 'Terjadi kesalahan saat import: ' . $e->getMessage(),
                'flashId' => uniqid(),
            ]);
        }
    }

    /**
     * Download template for Teachers import
     */
    public function downloadTeacherTemplate()
    {
        return Excel::download(
            new TeacherTemplate(),
            'template_guru.xlsx'
        );
    }

    /**
     * Import teachers from Excel
     */
    public function importTeacher(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120', // 5MB max
        ]);

        try {
            $import = new TeacherImport();
            Excel::import($import, $request->file('file'));

            // Check if there were any validation failures
            $failures = $import->failures();

            if ($failures->isNotEmpty()) {
                $errors = [];
                foreach ($failures as $failure) {
                    $errors[] = [
                        'row' => $failure->row(),
                        'attribute' => $failure->attribute(),
                        'errors' => $failure->errors(),
                        'values' => $failure->values(),
                    ];
                }

                return back()->with([
                    'error' => 'Beberapa data guru gagal diimport. Silakan periksa kembali file Excel Anda.',
                    'failures' => $errors,
                    'flashId' => uniqid(),
                ]);
            }

            return back()->with([
                'success' => 'Data guru berhasil diimport!',
                'flashId' => uniqid(),
            ]);

        } catch (\Exception $e) {
            Log::error('Teacher import failed: ' . $e->getMessage());

            return back()->with([
                'error' => 'Terjadi kesalahan saat import guru: ' . $e->getMessage(),
                'flashId' => uniqid(),
            ]);
        }
    }

    /**
     * Download template for Guardians import
     */
    public function downloadGuardianTemplate()
    {
        return Excel::download(
            new GuardianTemplate(),
            'template_wali.xlsx'
        );
    }

    /**
     * Import guardians from Excel
     */
    public function importGuardian(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120', // 5MB max
        ]);

        try {
            $import = new GuardianImport();
            Excel::import($import, $request->file('file'));

            // Check if there were any validation failures
            $failures = $import->failures();

            if ($failures->isNotEmpty()) {
                $errors = [];
                foreach ($failures as $failure) {
                    $errors[] = [
                        'row' => $failure->row(),
                        'attribute' => $failure->attribute(),
                        'errors' => $failure->errors(),
                        'values' => $failure->values(),
                    ];
                }

                return back()->with([
                    'error' => 'Beberapa data wali gagal diimport. Silakan periksa kembali file Excel Anda.',
                    'failures' => $errors,
                    'flashId' => uniqid(),
                ]);
            }

            return back()->with([
                'success' => 'Data wali berhasil diimport!',
                'flashId' => uniqid(),
            ]);

        } catch (\Exception $e) {
            Log::error('Guardian import failed: ' . $e->getMessage());

            return back()->with([
                'error' => 'Terjadi kesalahan saat import wali: ' . $e->getMessage(),
                'flashId' => uniqid(),
            ]);
        }
    }
}
