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
        Schema::table('hafalans', function (Blueprint $table) {
            // Drop existing foreign key constraints
            $table->dropForeign(['student_id']);
            $table->dropForeign(['teacher_id']);

            // Re-add foreign key constraints referencing profiles table
            $table->foreign('student_id')->references('id')->on('profiles')->cascadeOnDelete();
            $table->foreign('teacher_id')->references('id')->on('profiles')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hafalans', function (Blueprint $table) {
            // Drop profile foreign keys
            $table->dropForeign(['student_id']);
            $table->dropForeign(['teacher_id']);

            // Re-add original foreign keys
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('teacher_id')->references('id')->on('teachers')->nullOnDelete();
        });
    }
};