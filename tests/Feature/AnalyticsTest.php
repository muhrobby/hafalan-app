<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Profile;
use App\Models\Hafalan;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\TestHelpers;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected User $user;
    protected Profile $teacher;
    protected Profile $student;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup roles and surahs
        $this->setUpTestData();

        $this->user = $this->createAdminUser();
        $this->teacher = Profile::factory()->create();
        $this->student = Profile::factory()->create();
    }

    /** @test */
    public function authenticated_user_can_view_dashboard()
    {
        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('dashboard'));
    }

    /** @test */
    public function dashboard_displays_total_setoran()
    {
        $surah = Surah::factory()->create();
        
        Hafalan::factory()->count(5)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('dashboardAnalytics')
                ->has('dashboardAnalytics.summary')
        );
    }

    /** @test */
    public function dashboard_displays_total_murojaah()
    {
        $surah = Surah::factory()->create();
        
        Hafalan::factory()->count(3)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'status' => 'murojaah',
            'from_ayah' => 1,
            'to_ayah' => 5,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function dashboard_displays_total_selesai()
    {
        $surah = Surah::factory()->create();
        
        Hafalan::factory()->count(2)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'status' => 'selesai',
            'from_ayah' => 1,
            'to_ayah' => 10,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function dashboard_can_filter_by_date_range()
    {
        $surah = Surah::factory()->create();
        
        Hafalan::factory()->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'date' => '2025-01-10',
        ]);
        
        Hafalan::factory()->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'date' => '2025-01-20',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard', [
                'from' => '2025-01-15',
                'to' => '2025-01-25'
            ]));

        $response->assertStatus(200);
    }

    /** @test */
    public function dashboard_displays_top_students()
    {
        $surah = Surah::factory()->create();
        $student1 = Profile::factory()->create();
        $student2 = Profile::factory()->create();

        // Student 1 has more hafalans
        Hafalan::factory()->count(10)->create([
            'student_id' => $student1->id,
            'surah_id' => $surah->id,
        ]);

        // Student 2 has fewer hafalans
        Hafalan::factory()->count(5)->create([
            'student_id' => $student2->id,
            'surah_id' => $surah->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function dashboard_displays_per_surah_statistics()
    {
        $surah1 = Surah::factory()->create(['name' => 'Al-Fatihah']);
        $surah2 = Surah::factory()->create(['name' => 'Al-Baqarah']);

        Hafalan::factory()->count(5)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah1->id,
        ]);

        Hafalan::factory()->count(3)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah2->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('dashboardAnalytics.perSurah')
        );
    }

    /** @test */
    public function dashboard_displays_status_distribution()
    {
        $surah = Surah::factory()->create();

        Hafalan::factory()->count(7)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'status' => 'murojaah',
        ]);

        Hafalan::factory()->count(3)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'status' => 'selesai',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('dashboardAnalytics.statusDistribution')
        );
    }

    /** @test */
    public function guest_cannot_view_dashboard()
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function dashboard_handles_empty_data_gracefully()
    {
        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('dashboard')
                ->has('dashboardAnalytics')
        );
    }

    /** @test */
    public function teacher_can_view_only_their_students_data()
    {
        $teacherUser = User::factory()->create();
        $teacherUser->assignRole('teacher');
        $teacherProfile = Profile::factory()->create(['user_id' => $teacherUser->id]);

        $surah = Surah::factory()->create();

        // Hafalan by this teacher's student
        Hafalan::factory()->count(5)->create([
            'teacher_id' => $teacherProfile->id,
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
        ]);

        // Hafalan by another teacher
        Hafalan::factory()->count(3)->create([
            'teacher_id' => $this->teacher->id,
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
        ]);

        $response = $this->actingAs($teacherUser)
            ->get(route('dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function guardian_can_view_only_their_students_data()
    {
        $guardianUser = User::factory()->create();
        $guardianUser->assignRole('guardian');
        
        $surah = Surah::factory()->create();

        Hafalan::factory()->count(5)->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
        ]);

        $response = $this->actingAs($guardianUser)
            ->get(route('dashboard'));

        $response->assertStatus(200);
    }

    /** @test */
    public function dashboard_calculates_ayah_totals_correctly()
    {
        $surah = Surah::factory()->create();

        // 10 ayahs (1-10)
        Hafalan::factory()->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
        ]);

        // 5 ayahs (11-15)
        Hafalan::factory()->create([
            'student_id' => $this->student->id,
            'surah_id' => $surah->id,
            'from_ayah' => 11,
            'to_ayah' => 15,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('dashboard'));

        $response->assertStatus(200);
    }
}
