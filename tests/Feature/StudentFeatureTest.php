<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Student;
use App\Models\Classe;
use App\Models\Guardian;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\TestHelpers;

class StudentFeatureTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup roles and surahs
        $this->setUpTestData();

        $this->adminUser = $this->createAdminUser();
    }

    /** @test */
    public function admin_can_view_students_index()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('students.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('students/index'));
    }

    /** @test */
    public function guest_cannot_view_students_index()
    {
        $response = $this->get(route('students.index'));

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function admin_can_create_student()
    {
        $user = User::factory()->create();
        $classe = Classe::factory()->create();

        $data = [
            'user_id' => $user->id,
            'nis' => '2501150001',
            'birth_date' => '2010-05-15',
            'class_id' => $classe->id,
            'phone' => '081234567890',
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('students.store'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            'user_id' => $user->id,
            'nis' => '2501150001',
        ]);
    }

    /** @test */
    public function nis_must_be_unique()
    {
        $student1 = Student::factory()->create(['nis' => '2501150001']);
        $user = User::factory()->create();
        $classe = Classe::factory()->create();

        $data = [
            'user_id' => $user->id,
            'nis' => '2501150001', // duplicate
            'birth_date' => '2010-05-15',
            'class_id' => $classe->id,
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('students.store'), $data);

        $response->assertSessionHasErrors('nis');
    }

    /** @test */
    public function admin_can_update_student()
    {
        $student = Student::factory()->create();
        $newClasse = Classe::factory()->create();

        $data = [
            'user_id' => $student->user_id,
            'nis' => $student->nis,
            'birth_date' => '2011-06-20',
            'class_id' => $newClasse->id,
            'phone' => '089876543210',
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('students.update', $student), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'class_id' => $newClasse->id,
            'phone' => '089876543210',
        ]);
    }

    /** @test */
    public function admin_can_delete_student()
    {
        $student = Student::factory()->create();

        $response = $this->actingAs($this->adminUser)
            ->delete(route('students.destroy', $student));

        $response->assertRedirect();
        $this->assertDatabaseMissing('students', [
            'id' => $student->id,
        ]);
    }

    /** @test */
    public function admin_can_attach_guardian_to_student()
    {
        $student = Student::factory()->create();
        $guardian = Guardian::factory()->create();

        $student->guardians()->attach($guardian->id);

        $this->assertDatabaseHas('guardian_student', [
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
        ]);
    }

    /** @test */
    public function admin_can_detach_guardian_from_student()
    {
        $student = Student::factory()->create();
        $guardian = Guardian::factory()->create();
        $student->guardians()->attach($guardian->id);

        $student->guardians()->detach($guardian->id);

        $this->assertDatabaseMissing('guardian_student', [
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
        ]);
    }

    /** @test */
    public function student_can_have_multiple_guardians()
    {
        $student = Student::factory()->create();
        $guardians = Guardian::factory()->count(3)->create();

        $student->guardians()->attach($guardians->pluck('id'));

        $this->assertCount(3, $student->guardians);
    }

    /** @test */
    public function students_can_be_filtered_by_class()
    {
        $classe1 = Classe::factory()->create();
        $classe2 = Classe::factory()->create();

        Student::factory()->count(2)->create(['class_id' => $classe1->id]);
        Student::factory()->count(3)->create(['class_id' => $classe2->id]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('students.index', ['class_id' => $classe1->id]));

        $response->assertStatus(200);
    }

    /** @test */
    public function students_index_can_be_searched_by_name()
    {
        $user1 = User::factory()->create(['name' => 'Ahmad Student']);
        $user2 = User::factory()->create(['name' => 'Budi Student']);
        
        Student::factory()->create(['user_id' => $user1->id]);
        Student::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('students.index', ['search' => 'Ahmad']));

        $response->assertStatus(200);
    }

    /** @test */
    public function birth_date_must_be_valid_date()
    {
        $user = User::factory()->create();
        $classe = Classe::factory()->create();

        $data = [
            'user_id' => $user->id,
            'nis' => '2501150001',
            'birth_date' => 'invalid-date',
            'class_id' => $classe->id,
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('students.store'), $data);

        $response->assertSessionHasErrors('birth_date');
    }

    /** @test */
    public function phone_format_is_validated()
    {
        $user = User::factory()->create();
        $classe = Classe::factory()->create();

        $data = [
            'user_id' => $user->id,
            'nis' => '2501150001',
            'birth_date' => '2010-05-15',
            'class_id' => $classe->id,
            'phone' => '123', // too short
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('students.store'), $data);

        $response->assertSessionHasErrors('phone');
    }

    /** @test */
    public function non_admin_user_cannot_create_student()
    {
        $regularUser = User::factory()->create();
        $regularUser->assignRole('student');

        $user = User::factory()->create();
        $classe = Classe::factory()->create();

        $data = [
            'user_id' => $user->id,
            'nis' => '2501150001',
            'birth_date' => '2010-05-15',
            'class_id' => $classe->id,
        ];

        $response = $this->actingAs($regularUser)
            ->post(route('students.store'), $data);

        $response->assertStatus(403);
    }
}
