<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ApiKey extends Model
{
    protected $table = 'api_keys';

    protected $fillable = [
        'user_id',
        'name',
        'token'
    ];

    protected static function booted()
    {
        static::addGlobalScope('parentUser', function (Builder $builder) {
            $builder->where('user_id', Auth::id());
            return $builder;
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
