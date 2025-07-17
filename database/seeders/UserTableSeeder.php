<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if(User::count() === 0) {
            User::factory()->create([
                'role' => 'admin',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password'),
            ]);
        }
    }
}
