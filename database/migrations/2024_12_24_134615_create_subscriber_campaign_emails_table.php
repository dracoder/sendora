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
        Schema::create('subscriber_campaign_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId(('subscriber_id'))->constrained()->cascadeOnDelete();
            $table->foreignId('email_id')->constrained()->cascadeOnDelete();
            $table->dateTime('scheduled_at')->nullable();
            $table->boolean('sent')->default(false);
            $table->dateTime('sent_at')->nullable();
            $table->boolean('retry')->default(false);
            $table->text('exception')->nullable();
            $table->dateTime('failed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriber_campaign_emails');
    }
};
