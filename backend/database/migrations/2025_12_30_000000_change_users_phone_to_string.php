<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
        });

        // Update existing phone numbers that are missing the leading zero.
        // A standard phone number in Vietnam has 10 digits (including leading 0).
        // If it is numeric, has length 9, and doesn't start with 0, we prepend '0'.
        $users = DB::table('users')->whereNotNull('phone')->get();
        foreach ($users as $user) {
            $phone = (string)$user->phone;
            if (strlen($phone) === 9 && is_numeric($phone) && !str_starts_with($phone, '0')) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['phone' => '0' . $phone]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('phone')->nullable()->change();
        });
    }
};
