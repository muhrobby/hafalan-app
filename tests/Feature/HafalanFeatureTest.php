<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Profile;
use App\Models\Hafalan;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\TestHelpers;

class HafalanFeatureTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected User $user;
    protected Profile $teacher;
    protected Profile $student;
    protected Surah $surah;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup roles and surahs
        $this->setUpTestData();

        $this->user = $this->createTeacherUser();
        $this->teacher = Profile::factory()->create(['user_id' => $this->user->id]);
        $this->student = Profile::factory()->create();
        $this->surah = Surah::first(); // Use seeded surah
    }

    /** @test */
    public function authenticated_user_can_view_hafalan_index()
    {
        $response = $this->actingAs($this->user)
            ->get(route('hafalan.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('hafalan/Index'));
    }

    /** @test */
    public function guest_cannot_view_hafalan_index()
    {
        $response = $this->get(route('hafalan.index'));

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function authenticated_user_can_view_create_hafalan_form()
    {
        $response = $this->actingAs($this->user)
            ->get(route('hafalan.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('hafalan/Create')
                ->has('students')
                ->has('surahs')
        );
    }

    /** @test */
    public function authenticated_user_can_create_hafalan()
    {
        $data = [
            'student_id' => $this->student->id,
            'surah_id' => $this->surah->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
            'date' => now()->format('Y-m-d'),
            'status' => 'murojaah',
            'notes' => 'Test hafalan',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('hafalan.store'), $data);

        $response->assertRedirect(route('hafalan.index'));
        $this->assertDatabaseHas('hafalans', [
            'student_id' => $this->student->id,
            'surah_id' => $this->surah->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
            'status' => 'murojaah',
        ]);
    }

    /** @test */
    public function student_id_is_required_when_creating_hafalan()
    {
        $data = [
            'surah_id' => $this->surah->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
            'date' => now()->format('Y-m-d'),
            'status' => 'murojaah',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('hafalan.store'), $data);

        $response->assertSessionHasErrors('student_id');
    }

    /** @test */
    public function surah_id_is_required_when_creating_hafalan()
    {
        $data = [
            'student_id' => $this->student->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
            'date' => now()->format('Y-m-d'),
            'status' => 'murojaah',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('hafalan.store'), $data);

        $response->assertSessionHasErrors('surah_id');
    }

    /** @test */
    public function from_ayah_must_be_positive_integer()
    {
        $data = [
            'student_id' => $this->student->id,
            'surah_id' => $this->surah->id,
            'from_ayah' => -1,
            'to_ayah' => 10,
            'date' => now()->format('Y-m-d'),
            'status' => 'murojaah',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('hafalan.store'), $data);

        $response->assertSessionHasErrors('from_ayah');
    }

    /** @test */
    public function to_ayah_must_be_greater_than_or_equal_to_from_ayah()
    {
        $data = [
            'student_id' => $this->student->id,
            'surah_id' => $this->surah->id,
            'from_ayah' => 10,
            'to_ayah' => 5,
            'date' => now()->format('Y-m-d'),
            'status' => 'murojaah',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('hafalan.store'), $data);

        $response->assertSessionHasErrors('to_ayah');
    }

    /** @test */
    public function status_must_be_valid_value()
    {
        $data = [
            'student_id' => $this->student->id,
            'surah_id' => $this->surah->id,
            'from_ayah' => 1,
            'to_ayah' => 10,
            'date' => now()->format('Y-m-d'),
            'status' => 'invalid_status',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('hafalan.store'), $data);

        $response->assertSessionHasErrors('status');
    }

    /** @test */
    public function authenticated_user_can_update_hafalan()
    {
        $hafalan = Hafalan::factory()->create([
            'student_id' => $this->student->id,
            'teacher_id' => $this->teacher->id,
            'status' => 'murojaah',
        ]);

        $updateData = [
            'student_id' => $this->student->id,
            'surah_id' => $hafalan->surah_id,
            'from_ayah' => $hafalan->from_ayah,
            'to_ayah' => $hafalan->to_ayah,
            'date' => $hafalan->date->format('Y-m-d'),
            'status' => 'selesai',
            'notes' => 'Updated notes',
        ];

        $response = $this->actingAs($this->user)
            ->put(route('hafalan.update', $hafalan), $updateData);

        $response->assertRedirect(route('hafalan.index'));
        $this->assertDatabaseHas('hafalans', [
            'id' => $hafalan->id,
            'status' => 'selesai',
            'notes' => 'Updated notes',
        ]);
    }

    /** @test */
    public function authenticated_user_can_delete_hafalan()
    {
        $hafalan = Hafalan::factory()->create([
            'student_id' => $this->student->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('hafalan.destroy', $hafalan));

        $response->assertRedirect(route('hafalan.index'));
        $this->assertDatabaseMissing('hafalans', [
            'id' => $hafalan->id,
        ]);
    }

    /** @test */
    public function hafalan_index_can_be_filtered_by_date()
    {
        Hafalan::factory()->create(['date' => '2025-01-10', 'student_id' => $this->student->id]);
        Hafalan::factory()->create(['date' => '2025-01-20', 'student_id' => $this->student->id]);

        $response = $this->actingAs($this->user)
            ->get(route('hafalan.index', ['from' => '2025-01-15', 'to' => '2025-01-25']));

        $response->assertStatus(200);
    }

    /** @test */
    public function hafalan_index_can_be_filtered_by_student()
    {
        $student2 = Profile::factory()->create();
        
        Hafalan::factory()->create(['student_id' => $this->student->id]);
        Hafalan::factory()->create(['student_id' => $student2->id]);

        $response = $this->actingAs($this->user)
            ->get(route('hafalan.index', ['student_id' => $this->student->id]));

        $response->assertStatus(200);
    }

    /** @test */
    public function hafalan_index_can_be_filtered_by_surah()
    {
        $surah2 = Surah::factory()->create();
        
        Hafalan::factory()->create(['surah_id' => $this->surah->id, 'student_id' => $this->student->id]);
        Hafalan::factory()->create(['surah_id' => $surah2->id, 'student_id' => $this->student->id]);

        $response = $this->actingAs($this->user)
            ->get(route('hafalan.index', ['surah_id' => $this->surah->id]));

        $response->assertStatus(200);
    }
}
