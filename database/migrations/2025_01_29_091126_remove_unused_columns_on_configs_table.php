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
        Schema::table('configs', function (Blueprint $table) {
            $table->string('type')->default('text')->change();
            $table->dropColumn('is_encrypted');
            $table->dropColumn('is_json');
            $table->dropColumn('is_boolean');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configs', function (Blueprint $table) {
            $table->string('type')->default('string')->change();
            $table->boolean('is_encrypted')->default(false);
            $table->boolean('is_json')->default(false);
            $table->boolean('is_boolean')->default(false);
        });
    }
};
