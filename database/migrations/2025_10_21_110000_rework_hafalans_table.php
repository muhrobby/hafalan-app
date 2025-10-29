<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hafalans', function (Blueprint $table) {
            if (Schema::hasColumn('hafalans', 'score')) {
                $table->dropColumn('score');
            }

            if (Schema::hasColumn('hafalans', 'juz')) {
                $table->dropColumn('juz');
            }

            if (Schema::hasColumn('hafalans', 'type')) {
                $table->dropColumn('type');
            }

            if (Schema::hasColumn('hafalans', 'parent_id')) {
                $table->dropForeign(['parent_id']);
                $table->dropColumn('parent_id');
            }

            if (Schema::hasColumn('hafalans', 'status')) {
                $table->dropColumn('status');
            }

            $table->enum('status', ['murojaah', 'selesai'])->default('murojaah')->after('date');
        });
    }

    public function down(): void
    {
        Schema::table('hafalans', function (Blueprint $table) {
            $table->dropColumn('status');

            $table->unsignedTinyInteger('score')->nullable()->after('date');
            $table->unsignedTinyInteger('juz')->nullable()->after('to_ayah');
            $table->enum('type', ['tambah', 'murojaah'])->default('tambah')->after('juz');
            $table->foreignId('parent_id')->nullable()->after('type')->constrained('hafalans')->nullOnDelete();
        });
    }
};
