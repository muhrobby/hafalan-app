<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'phone')) {
                $table->string('phone')->nullable()->after('birth_date');
            }

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            if (Schema::hasColumn('students', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
