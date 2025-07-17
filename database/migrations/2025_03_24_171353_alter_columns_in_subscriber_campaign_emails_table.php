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
        Schema::table('subscriber_campaign_emails', function (Blueprint $table) {
            $table->boolean('opened')->default(false)->after('sent_at');
            $table->timestamp('opened_at')->nullable()->after('opened');
            $table->string('tracking_id')->nullable()->after('subscriber_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriber_campaign_emails', function (Blueprint $table) {
            $table->dropColumn(['opened', 'opened_at', 'tracking_id']);
        });
    }
};
