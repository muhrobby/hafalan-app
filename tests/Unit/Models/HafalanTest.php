<?php<?php<?php



namespace Tests\Unit\Models;



use App\Models\Hafalan;namespace Tests\Unit\Models;namespace Tests\Unit\Models;

use App\Models\Profile;

use App\Models\Surah;

use Illuminate\Foundation\Testing\RefreshDatabase;

use Tests\TestCase;use App\Models\Hafalan;use App\Models\Hafalan;

use Tests\TestHelpers;

use App\Models\Profile;use App\Models\Profile;

class HafalanTest extends TestCase

{use App\Models\Surah;use App\Models\Surah;

    use RefreshDatabase, TestHelpers;

use Illuminate\Foundation\Testing\RefreshDatabase;use Illuminate\Foundation\Testing\RefreshDatabase;

    protected function setUp(): void

    {use Tests\TestCase;use Tests\TestCase;

        parent::setUp();

        $this->setUpTestData();use Tests\TestHelpers;

    }

class HafalanTest extends TestCase

    /** @test */

    public function it_has_fillable_attributes()class HafalanTest extends TestCase{

    {

        $hafalan = new Hafalan();{    use RefreshDatabase;

        $fillable = ['student_id', 'teacher_id', 'surah_id', 'from_ayah', 'to_ayah', 'date', 'status', 'notes'];

            use RefreshDatabase, TestHelpers;

        $this->assertEquals($fillable, $hafalan->getFillable());

    }    /** @test */



    /** @test */    protected function setUp(): void    public function it_has_fillable_attributes()

    public function it_casts_attributes_correctly()

    {    {    {

        $student = Profile::factory()->student()->create();

        $teacher = Profile::factory()->teacher()->create();        parent::setUp();        $fillable = [

        $surah = Surah::first();

        $this->setUpTestData();            'student_id',

        $hafalan = Hafalan::factory()->create([

            'student_id' => $student->id,    }            'teacher_id',

            'teacher_id' => $teacher->id,

            'surah_id' => $surah->id,            'surah_id',

            'date' => '2024-01-15',

            'from_ayah' => 1,    /** @test */            'from_ayah',

            'to_ayah' => 7,

        ]);    public function it_has_fillable_attributes()            'to_ayah',



        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $hafalan->date);    {            'date',

        $this->assertIsInt($hafalan->from_ayah);

        $this->assertIsInt($hafalan->to_ayah);        $hafalan = new Hafalan();            'status',

        $this->assertIsString($hafalan->status);

    }        $fillable = ['student_id', 'teacher_id', 'surah_id', 'from_ayah', 'to_ayah', 'date', 'status', 'notes'];            'notes',



    /** @test */                ];

    public function it_belongs_to_student_profile()

    {        $this->assertEquals($fillable, $hafalan->getFillable());

        $student = Profile::factory()->student()->create();

        $teacher = Profile::factory()->teacher()->create();    }        $hafalan = new Hafalan();



        $hafalan = Hafalan::factory()->create([        

            'student_id' => $student->id,

            'teacher_id' => $teacher->id,    /** @test */        $this->assertEquals($fillable, $hafalan->getFillable());

        ]);

    public function it_casts_attributes_correctly()    }

        $this->assertInstanceOf(Profile::class, $hafalan->student);

        $this->assertEquals($student->id, $hafalan->student->id);    {

    }

        $student = Profile::factory()->student()->create();    /** @test */

    /** @test */

    public function it_belongs_to_teacher_profile()        $teacher = Profile::factory()->teacher()->create();    public function it_casts_attributes_correctly()

    {

        $student = Profile::factory()->student()->create();        $surah = Surah::first();    {

        $teacher = Profile::factory()->teacher()->create();

        $hafalan = Hafalan::factory()->create([

        $hafalan = Hafalan::factory()->create([

            'student_id' => $student->id,        $hafalan = Hafalan::factory()->create([            'from_ayah' => '10',

            'teacher_id' => $teacher->id,

        ]);            'student_id' => $student->id,            'to_ayah' => '20',



        $this->assertInstanceOf(Profile::class, $hafalan->teacher);            'teacher_id' => $teacher->id,            'date' => '2025-01-15',

        $this->assertEquals($teacher->id, $hafalan->teacher->id);

    }            'surah_id' => $surah->id,        ]);



    /** @test */            'date' => '2024-01-15',

    public function it_belongs_to_surah()

    {            'from_ayah' => 1,        $this->assertIsInt($hafalan->from_ayah);

        $surah = Surah::first();

        $hafalan = Hafalan::factory()->create(['surah_id' => $surah->id]);            'to_ayah' => 7,        $this->assertIsInt($hafalan->to_ayah);



        $this->assertInstanceOf(Surah::class, $hafalan->surah);        ]);        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $hafalan->date);

        $this->assertEquals($surah->id, $hafalan->surah->id);

    }    }



    /** @test */        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $hafalan->date);

    public function it_can_filter_by_date_range()

    {        $this->assertIsInt($hafalan->from_ayah);    /** @test */

        $student = Profile::factory()->student()->create();

        $teacher = Profile::factory()->teacher()->create();        $this->assertIsInt($hafalan->to_ayah);    public function it_belongs_to_student()



        Hafalan::factory()->create([        $this->assertIsString($hafalan->status);    {

            'student_id' => $student->id,

            'teacher_id' => $teacher->id,    }        $student = Profile::factory()->create();

            'date' => '2024-01-10'

        ]);        $hafalan = Hafalan::factory()->create(['student_id' => $student->id]);

        Hafalan::factory()->create([

            'student_id' => $student->id,    /** @test */

            'teacher_id' => $teacher->id,

            'date' => '2024-01-20'    public function it_belongs_to_student_profile()        $this->assertInstanceOf(Profile::class, $hafalan->student);

        ]);

        Hafalan::factory()->create([    {        $this->assertEquals($student->id, $hafalan->student->id);

            'student_id' => $student->id,

            'teacher_id' => $teacher->id,        $student = Profile::factory()->student()->create();    }

            'date' => '2024-01-30'

        ]);        $teacher = Profile::factory()->teacher()->create();



        $filtered = Hafalan::betweenDates('2024-01-15', '2024-01-25')->get();    /** @test */



        $this->assertCount(1, $filtered);        $hafalan = Hafalan::factory()->create([    public function it_belongs_to_teacher()

    }

            'student_id' => $student->id,    {

    /** @test */

    public function it_can_filter_from_date_only()            'teacher_id' => $teacher->id,        $teacher = Profile::factory()->create();

    {

        $student = Profile::factory()->student()->create();        ]);        $hafalan = Hafalan::factory()->create(['teacher_id' => $teacher->id]);

        $teacher = Profile::factory()->teacher()->create();



        Hafalan::factory()->create([

            'student_id' => $student->id,        $this->assertInstanceOf(Profile::class, $hafalan->student);        $this->assertInstanceOf(Profile::class, $hafalan->teacher);

            'teacher_id' => $teacher->id,

            'date' => '2024-01-10'        $this->assertEquals($student->id, $hafalan->student->id);        $this->assertEquals($teacher->id, $hafalan->teacher->id);

        ]);

        Hafalan::factory()->create([    }    }

            'student_id' => $student->id,

            'teacher_id' => $teacher->id,

            'date' => '2024-01-20'

        ]);    /** @test */    /** @test */



        $filtered = Hafalan::betweenDates('2024-01-15')->get();    public function it_belongs_to_teacher_profile()    public function it_belongs_to_surah()



        $this->assertCount(1, $filtered);    {    {

    }

        $student = Profile::factory()->student()->create();        $surah = Surah::factory()->create();

    /** @test */

    public function it_can_filter_to_date_only()        $teacher = Profile::factory()->teacher()->create();        $hafalan = Hafalan::factory()->create(['surah_id' => $surah->id]);

    {

        $student = Profile::factory()->student()->create();

        $teacher = Profile::factory()->teacher()->create();

        $hafalan = Hafalan::factory()->create([        $this->assertInstanceOf(Surah::class, $hafalan->surah);

        Hafalan::factory()->create([

            'student_id' => $student->id,            'student_id' => $student->id,        $this->assertEquals($surah->id, $hafalan->surah->id);

            'teacher_id' => $teacher->id,

            'date' => '2024-01-10'            'teacher_id' => $teacher->id,    }

        ]);

        Hafalan::factory()->create([        ]);

            'student_id' => $student->id,

            'teacher_id' => $teacher->id,    /** @test */

            'date' => '2024-01-30'

        ]);        $this->assertInstanceOf(Profile::class, $hafalan->teacher);    public function it_can_filter_by_date_range()



        $filtered = Hafalan::betweenDates(null, '2024-01-20')->get();        $this->assertEquals($teacher->id, $hafalan->teacher->id);    {



        $this->assertCount(1, $filtered);    }        Hafalan::factory()->create(['date' => '2025-01-10']);

    }

        $hafalan2 = Hafalan::factory()->create(['date' => '2025-01-15']);

    /** @test */

    public function it_validates_status_values()    /** @test */        Hafalan::factory()->create(['date' => '2025-01-20']);

    {

        $hafalan = Hafalan::factory()->murojaah()->create();    public function it_belongs_to_surah()

        $this->assertEquals('murojaah', $hafalan->status);

    {        $results = Hafalan::betweenDates('2025-01-14', '2025-01-16')->get();

        $hafalan2 = Hafalan::factory()->selesai()->create();

        $this->assertEquals('selesai', $hafalan2->status);        $surah = Surah::first();

    }

        $hafalan = Hafalan::factory()->create(['surah_id' => $surah->id]);        $this->assertCount(1, $results);

    /** @test */

    public function it_can_calculate_total_ayahs()        $this->assertEquals($hafalan2->id, $results->first()->id);

    {

        $hafalan = Hafalan::factory()->withAyahRange(1, 7)->create();        $this->assertInstanceOf(Surah::class, $hafalan->surah);    }



        $totalAyahs = ($hafalan->to_ayah - $hafalan->from_ayah) + 1;        $this->assertEquals($surah->id, $hafalan->surah->id);



        $this->assertEquals(7, $totalAyahs);    }    /** @test */

    }

    public function it_can_filter_from_date_only()

    /** @test */

    public function from_ayah_must_be_less_than_or_equal_to_to_ayah()    /** @test */    {

    {

        $hafalan = Hafalan::factory()->create([    public function it_can_filter_by_date_range()        Hafalan::factory()->create(['date' => '2025-01-10']);

            'from_ayah' => 5,

            'to_ayah' => 10,    {        $hafalan2 = Hafalan::factory()->create(['date' => '2025-01-15']);

        ]);

        $student = Profile::factory()->student()->create();        $hafalan3 = Hafalan::factory()->create(['date' => '2025-01-20']);

        $this->assertLessThanOrEqual($hafalan->to_ayah, $hafalan->from_ayah);

    }        $teacher = Profile::factory()->teacher()->create();

}

        $results = Hafalan::betweenDates('2025-01-15', null)->get();

        Hafalan::factory()->create([

            'student_id' => $student->id,        $this->assertCount(2, $results);

            'teacher_id' => $teacher->id,        $this->assertTrue($results->contains($hafalan2));

            'date' => '2024-01-10'        $this->assertTrue($results->contains($hafalan3));

        ]);    }

        Hafalan::factory()->create([

            'student_id' => $student->id,    /** @test */

            'teacher_id' => $teacher->id,    public function it_can_filter_to_date_only()

            'date' => '2024-01-20'    {

        ]);        $hafalan1 = Hafalan::factory()->create(['date' => '2025-01-10']);

        Hafalan::factory()->create([        $hafalan2 = Hafalan::factory()->create(['date' => '2025-01-15']);

            'student_id' => $student->id,        Hafalan::factory()->create(['date' => '2025-01-20']);

            'teacher_id' => $teacher->id,

            'date' => '2024-01-30'        $results = Hafalan::betweenDates(null, '2025-01-16')->get();

        ]);

        $this->assertCount(2, $results);

        $filtered = Hafalan::betweenDates('2024-01-15', '2024-01-25')->get();        $this->assertTrue($results->contains($hafalan1));

        $this->assertTrue($results->contains($hafalan2));

        $this->assertCount(1, $filtered);    }

    }

    /** @test */

    /** @test */    public function it_validates_status_values()

    public function it_can_filter_from_date_only()    {

    {        $validStatuses = ['murojaah', 'selesai'];

        $student = Profile::factory()->student()->create();

        $teacher = Profile::factory()->teacher()->create();        foreach ($validStatuses as $status) {

            $hafalan = Hafalan::factory()->create(['status' => $status]);

        Hafalan::factory()->create([            $this->assertEquals($status, $hafalan->status);

            'student_id' => $student->id,        }

            'teacher_id' => $teacher->id,    }

            'date' => '2024-01-10'

        ]);    /** @test */

        Hafalan::factory()->create([    public function it_can_calculate_total_ayahs()

            'student_id' => $student->id,    {

            'teacher_id' => $teacher->id,        $hafalan = Hafalan::factory()->create([

            'date' => '2024-01-20'            'from_ayah' => 1,

        ]);            'to_ayah' => 10,

        ]);

        $filtered = Hafalan::betweenDates('2024-01-15')->get();

        $totalAyahs = $hafalan->to_ayah - $hafalan->from_ayah + 1;

        $this->assertCount(1, $filtered);        

    }        $this->assertEquals(10, $totalAyahs);

    }

    /** @test */

    public function it_can_filter_to_date_only()    /** @test */

    {    public function from_ayah_must_be_less_than_or_equal_to_to_ayah()

        $student = Profile::factory()->student()->create();    {

        $teacher = Profile::factory()->teacher()->create();        $hafalan = Hafalan::factory()->create([

            'from_ayah' => 5,

        Hafalan::factory()->create([            'to_ayah' => 10,

            'student_id' => $student->id,        ]);

            'teacher_id' => $teacher->id,

            'date' => '2024-01-10'        $this->assertLessThanOrEqual($hafalan->to_ayah, $hafalan->from_ayah);

        ]);    }

        Hafalan::factory()->create([}

            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'date' => '2024-01-30'
        ]);

        $filtered = Hafalan::betweenDates(null, '2024-01-20')->get();

        $this->assertCount(1, $filtered);
    }

    /** @test */
    public function it_validates_status_values()
    {
        $hafalan = Hafalan::factory()->murojaah()->create();
        $this->assertEquals('murojaah', $hafalan->status);

        $hafalan2 = Hafalan::factory()->selesai()->create();
        $this->assertEquals('selesai', $hafalan2->status);
    }

    /** @test */
    public function it_can_calculate_total_ayahs()
    {
        $hafalan = Hafalan::factory()->withAyahRange(1, 7)->create();

        $totalAyahs = ($hafalan->to_ayah - $hafalan->from_ayah) + 1;

        $this->assertEquals(7, $totalAyahs);
    }

    /** @test */
    public function from_ayah_must_be_less_than_or_equal_to_to_ayah()
    {
        $hafalan = Hafalan::factory()->create([
            'from_ayah' => 5,
            'to_ayah' => 10,
        ]);

        $this->assertLessThanOrEqual($hafalan->to_ayah, $hafalan->from_ayah);
    }
}
