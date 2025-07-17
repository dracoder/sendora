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
        Schema::table('credit_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('credit_transactions', 'subscription_id')) {
                $table->integer('subscription_id')->nullable()->after('user_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('credit_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('credit_transactions','subscription_id')) {
                $table->dropColumn('subscription_id');
            }
        });
    }
};
