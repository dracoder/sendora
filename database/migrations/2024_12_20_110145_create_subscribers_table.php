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
        Schema::create('subscribers', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_subscribed')->default(true);
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('title')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email_status')->nullable();
            $table->string('company')->nullable();
            $table->string('industry')->nullable();
            $table->string('location')->nullable();
            $table->text('profile_picture')->nullable();
            $table->text('linkedin_url')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscribers');
    }
};
