<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Tag extends Model
{
    protected $fillable = [
        'user_id',
        'organization_id',
        'name',
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
        return $this->belongsTo(User::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function subscribers()
    {
        return $this->belongsToMany(Subscriber::class, 'subscriber_tags');
    }
}
