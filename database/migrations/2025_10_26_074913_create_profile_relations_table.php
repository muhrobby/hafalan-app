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
        Schema::create('profile_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles')->cascadeOnDelete();
            $table->foreignId('related_profile_id')->constrained('profiles')->cascadeOnDelete();
            $table->enum('relation_type', ['guardian'])->default('guardian');
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            $table->unique(['profile_id', 'related_profile_id', 'relation_type'], 'unique_profile_relation');
            $table->index('profile_id');
            $table->index('related_profile_id');
            $table->index('relation_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_relations');
    }
};
