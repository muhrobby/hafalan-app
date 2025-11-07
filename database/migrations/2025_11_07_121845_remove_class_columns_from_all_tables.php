<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop foreign keys first
        if (Schema::hasColumn('students', 'class_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropForeign(['class_id']);
                $table->dropColumn('class_id');
            });
        }

        if (Schema::hasColumn('profiles', 'class_id')) {
            Schema::table('profiles', function (Blueprint $table) {
                $table->dropForeign(['class_id']);
                $table->dropColumn('class_id');
            });
        }

        if (Schema::hasTable('class_teacher')) {
            Schema::table('class_teacher', function (Blueprint $table) {
                if (Schema::hasColumn('class_teacher', 'class_id')) {
                    $table->dropForeign(['class_id']);
                }
            });
            Schema::dropIfExists('class_teacher');
        }

        // Remove class_name from profiles table
        if (Schema::hasColumn('profiles', 'class_name')) {
            Schema::table('profiles', function (Blueprint $table) {
                $table->dropColumn('class_name');
            });
        }

        // Remove class_id from hafalans table if exists
        if (Schema::hasColumn('hafalans', 'class_id')) {
            Schema::table('hafalans', function (Blueprint $table) {
                $table->dropColumn('class_id');
            });
        }

        // Drop classes table
        Schema::dropIfExists('classes');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate classes table
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Add class_name back to profiles
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('class_name', 100)->nullable()->after('phone');
        });

        // Add class_id back to hafalans if it was there
        Schema::table('hafalans', function (Blueprint $table) {
            $table->unsignedBigInteger('class_id')->nullable()->after('student_id');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('set null');
        });
    }
};
