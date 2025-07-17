<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'postal_code',
        'country_code',
        'tax_code',
        'vat_number',
        'pec',
        'sdi',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
