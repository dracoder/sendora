<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Template extends Model
{
    protected $fillable = [
        'organization_id',
        'name',
        'content',
    ];

    protected static function booted()
    {
        static::addGlobalScope('parentUser', function (Builder $builder) {
            $builder->whereHas('organization', function ($query) {
                $query->where('user_id', Auth::id());
            });
            return $builder;
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
