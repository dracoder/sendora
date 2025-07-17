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
        Schema::create('email_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_campaign_email_id')->constrained()->cascadeOnDelete();
            $table->string('tracking_id')->unique();
            $table->timestamp('opened_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->integer('open_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_trackings');
    }
};
