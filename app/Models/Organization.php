<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class Organization extends Model
{
    use HasFactory;
    
    protected $table = 'organizations';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'owner_name',
        'phone',
    ];

    protected $with = ['settings'];

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

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function settings()
    {
        return $this->hasOne(OrganizationSetting::class);
    }

    public function subscribers()
    {
        return $this->hasMany(Subscriber::class);
    }

    public function templates()
    {
        return $this->hasMany(Template::class);
    }
}
