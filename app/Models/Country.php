<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $primaryKey = 'code';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'name',
        'code',
    ];
}
