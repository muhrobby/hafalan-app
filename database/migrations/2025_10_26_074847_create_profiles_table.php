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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            
            // Identifiers (nullable, filled based on role)
            $table->string('nis', 50)->unique()->nullable()->comment('Student ID Number');
            $table->string('nip', 50)->unique()->nullable()->comment('Teacher ID Number');
            
            // Contact Info
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            
            // Personal Info (mostly for students)
            $table->date('birth_date')->nullable();
            $table->year('entry_year')->nullable();
            
            // Academic Info (for students)
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('nis');
            $table->index('nip');
            $table->index('class_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
