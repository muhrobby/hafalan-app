<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Migrate students → profiles
        DB::table('students')->orderBy('id')->chunk(100, function ($students) {
            foreach ($students as $student) {
                DB::table('profiles')->insertOrIgnore([
                    'user_id' => $student->user_id,
                    'nis' => $student->nis,
                    'birth_date' => $student->birth_date,
                    'phone' => $student->phone,
                    'class_id' => $student->class_id,
                    'created_at' => $student->created_at,
                    'updated_at' => $student->updated_at,
                ]);
            }
        });
        
        echo "✓ Students migrated to profiles\n";
        
        // 2. Migrate guardians → profiles
        DB::table('guardians')->orderBy('id')->chunk(100, function ($guardians) {
            foreach ($guardians as $guardian) {
                DB::table('profiles')->insertOrIgnore([
                    'user_id' => $guardian->user_id,
                    'phone' => $guardian->phone,
                    'created_at' => $guardian->created_at,
                    'updated_at' => $guardian->updated_at,
                ]);
            }
        });
        
        echo "✓ Guardians migrated to profiles\n";
        
        // 3. Migrate teachers → profiles
        DB::table('teachers')->orderBy('id')->chunk(100, function ($teachers) {
            foreach ($teachers as $teacher) {
                DB::table('profiles')->insertOrIgnore([
                    'user_id' => $teacher->user_id,
                    'nip' => $teacher->nip,
                    'phone' => $teacher->phone,
                    'created_at' => $teacher->created_at,
                    'updated_at' => $teacher->updated_at,
                ]);
            }
        });
        
        echo "✓ Teachers migrated to profiles\n";
        
        // 4. Migrate guardian_student relations → profile_relations
        DB::table('guardian_student')->orderBy('id')->chunk(100, function ($relations) {
            foreach ($relations as $relation) {
                $studentProfile = DB::table('profiles')
                    ->join('students', 'profiles.user_id', '=', 'students.user_id')
                    ->where('students.id', $relation->student_id)
                    ->value('profiles.id');
                
                $guardianProfile = DB::table('profiles')
                    ->join('guardians', 'profiles.user_id', '=', 'guardians.user_id')
                    ->where('guardians.id', $relation->guardian_id)
                    ->value('profiles.id');
                
                if ($studentProfile && $guardianProfile) {
                    DB::table('profile_relations')->insertOrIgnore([
                        'profile_id' => $studentProfile,
                        'related_profile_id' => $guardianProfile,
                        'relation_type' => 'guardian',
                        'created_at' => $relation->created_at ?? now(),
                        'updated_at' => $relation->updated_at ?? now(),
                    ]);
                }
            }
        });
        
        echo "✓ Guardian-Student relations migrated to profile_relations\n";
        
        // 5. Migrate teacher-class relations (from classes.teacher_id if exists)
        if (Schema::hasColumn('classes', 'teacher_id')) {
            DB::table('classes')->whereNotNull('teacher_id')->orderBy('id')->chunk(100, function ($classes) {
                foreach ($classes as $class) {
                    $teacherProfile = DB::table('profiles')
                        ->join('teachers', 'profiles.user_id', '=', 'teachers.user_id')
                        ->where('teachers.id', $class->teacher_id)
                        ->value('profiles.id');
                    
                    if ($teacherProfile) {
                        DB::table('class_teacher')->insertOrIgnore([
                            'teacher_id' => $teacherProfile,
                            'class_id' => $class->id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            });
            
            echo "✓ Teacher-Class relations migrated to class_teacher\n";
        }
        
        echo "\n=== DATA MIGRATION COMPLETED ===\n";
        echo "Profiles: " . DB::table('profiles')->count() . "\n";
        echo "Profile Relations: " . DB::table('profile_relations')->count() . "\n";
        echo "Class-Teacher: " . DB::table('class_teacher')->count() . "\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally restore data if needed
        DB::table('profile_relations')->truncate();
        DB::table('class_teacher')->truncate();
        DB::table('profiles')->truncate();
        
        echo "✓ Profiles tables cleared\n";
    }
};
