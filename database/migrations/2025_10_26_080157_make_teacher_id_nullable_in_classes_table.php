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
        Schema::table('classes', function (Blueprint $table) {
            // Drop the old foreign key constraint
            $table->dropForeign(['teacher_id']);
            
            // Make teacher_id nullable
            $table->foreignId('teacher_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            // Revert back to NOT NULL
            $table->foreignId('teacher_id')->nullable(false)->change();
        });
    }
};
