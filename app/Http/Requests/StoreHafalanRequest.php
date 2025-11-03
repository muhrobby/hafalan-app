<?php

namespace App\Http\Requests;

use App\Models\Hafalan;
use App\Models\Profile;
use App\Models\Surah;
use App\Support\ScopeService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreHafalanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user || ! $user->can('input-hafalan')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $studentId = (int) $this->input('student_id');

            if (! $studentId) {
                return true;
            }

            $profile = Profile::find($studentId);

            if (! $profile) {
                return false;
            }

            /** @var ScopeService $scope */
            $scope = app(ScopeService::class);

            return $scope->canAccessProfile($user, $profile);
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:profiles,id'],
            'surah_id'   => ['required', 'exists:surahs,id'],
            'from_ayah'  => ['required', 'integer', 'min:1'],
            'to_ayah'    => ['nullable', 'integer'],
            'date'       => ['required', 'date'],
            'score'      => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes'      => ['nullable', 'string'],
            'status'     => ['required', 'in:murojaah,selesai'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $fromAyah = $this->filled('from_ayah') ? (int) $this->input('from_ayah') : null;

        $this->merge([
            'student_id' => $this->filled('student_id') ? (int) $this->input('student_id') : null,
            'surah_id' => $this->filled('surah_id') ? (int) $this->input('surah_id') : null,
            'from_ayah' => $fromAyah,
            'to_ayah' => $fromAyah,
            'status' => $this->filled('status') ? $this->string('status')->toString() : 'murojaah',
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $this->ensureSurahMeta();

            $studentId = (int) $this->input('student_id');
            $surahId = (int) $this->input('surah_id');
            $fromAyah = (int) $this->input('from_ayah');
            $status = $this->string('status')->toString();

            if (! $studentId || ! $surahId) {
                return;
            }

            $surah = Surah::find($surahId);

            if (! $surah || $fromAyah < 1 || $fromAyah > $surah->ayah_count) {
                $validator->errors()->add('from_ayah', 'Ayat tidak valid untuk surah yang dipilih.');
                return;
            }

            $latestOverall = Hafalan::query()
                ->with('surah:id,code,name')
                ->where('student_id', $studentId)
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->first();

            $latestSameAyah = Hafalan::query()
                ->where('student_id', $studentId)
                ->where('surah_id', $surahId)
                ->where('from_ayah', $fromAyah)
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->first();

            $lastCompleted = Hafalan::query()
                ->where('student_id', $studentId)
                ->where('status', 'selesai')
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->first();

            if ($status === 'selesai') {
                if ($latestOverall && $latestOverall->status === 'murojaah' && ($latestOverall->surah_id !== $surahId || $latestOverall->from_ayah !== $fromAyah)) {
                    $validator->errors()->add('status', 'Selesaikan terlebih dahulu '.$this->surahLabel($latestOverall->surah_id, $latestOverall->from_ayah).'.');
                    return;
                }

                if ($latestSameAyah instanceof Hafalan) {
                    if ($latestSameAyah->status === 'selesai') {
                        $validator->errors()->add('status', 'Ayat ini sudah selesai. Lanjutkan ke ayat berikutnya.');
                        return;
                    }

                    if ($latestSameAyah->status !== 'murojaah') {
                        $validator->errors()->add('status', 'Status sebelumnya untuk ayat ini tidak valid.');
                        return;
                    }

                    return;
                }

                [$expectedSurah, $expectedAyah] = $this->determineNextExpected($lastCompleted);

                if (! $expectedSurah) {
                    $validator->errors()->add('surah_id', 'Seluruh surah telah selesai disetorkan.');
                    return;
                }

                if ($surahId !== $expectedSurah || $fromAyah !== $expectedAyah) {
                    $validator->errors()->add('from_ayah', 'Setoran berikutnya harus '.$this->surahLabel($expectedSurah, $expectedAyah).'.');
                }

                return;
            }

            // status === 'murojaah'
            if ($latestSameAyah) {
                if ($latestSameAyah->status === 'selesai') {
                    $validator->errors()->add('from_ayah', 'Ayat ini sudah selesai. Lanjutkan ke ayat berikutnya.');
                    return;
                }
            }

            if ($latestOverall && $latestOverall->status === 'murojaah' && ($latestOverall->surah_id !== $surahId || $latestOverall->from_ayah !== $fromAyah)) {
                $validator->errors()->add('status', 'Selesaikan terlebih dahulu '.$this->surahLabel($latestOverall->surah_id, $latestOverall->from_ayah).'.');
                return;
            }

            [$expectedSurah, $expectedAyah] = $this->determineNextExpected($lastCompleted);

            if (! $expectedSurah) {
                $validator->errors()->add('surah_id', 'Seluruh surah telah selesai disetorkan.');
                return;
            }

            if ($surahId !== $expectedSurah || $fromAyah !== $expectedAyah) {
                $validator->errors()->add('from_ayah', 'Setoran berikutnya harus '.$this->surahLabel($expectedSurah, $expectedAyah).'.');
            }
        });
    }

    protected static array $surahOrder = [];
    protected static array $surahIndexes = [];
    protected static array $surahAyahCount = [];
    protected static array $surahNames = [];
    protected static array $surahCodes = [];

    private function ensureSurahMeta(): void
    {
        if (! empty(self::$surahOrder)) {
            return;
        }

        $records = Surah::orderBy('id')->get(['id', 'code', 'name', 'ayah_count']);
        self::$surahOrder = $records->pluck('id')->toArray();
        self::$surahIndexes = array_flip(self::$surahOrder);
        self::$surahAyahCount = $records->pluck('ayah_count', 'id')->toArray();
        self::$surahNames = $records->pluck('name', 'id')->toArray();
        self::$surahCodes = $records->pluck('code', 'id')->toArray();
    }

    private function determineNextExpected(?Hafalan $lastCompleted): array
    {
        if (! $lastCompleted) {
            $firstSurah = self::$surahOrder[0] ?? null;
            return [$firstSurah, $firstSurah ? 1 : null];
        }

        $surahId = $lastCompleted->surah_id;
        $currentAyah = $lastCompleted->from_ayah;
        $totalAyah = self::$surahAyahCount[$surahId] ?? null;

        if ($totalAyah && $currentAyah < $totalAyah) {
            return [$surahId, $currentAyah + 1];
        }

        $currentIndex = self::$surahIndexes[$surahId] ?? null;

        if ($currentIndex === null || ! isset(self::$surahOrder[$currentIndex + 1])) {
            return [null, null];
        }

        return [self::$surahOrder[$currentIndex + 1], 1];
    }

    private function surahLabel(?int $surahId, ?int $ayah): string
    {
        if (! $surahId || ! $ayah) {
            return 'surah berikutnya';
        }

        $name = self::$surahNames[$surahId] ?? 'Surah';
        $code = self::$surahCodes[$surahId] ?? str_pad((string) $surahId, 3, '0', STR_PAD_LEFT);

        return sprintf('%s (%s) ayat %d', $name, $code, $ayah);
    }
}
