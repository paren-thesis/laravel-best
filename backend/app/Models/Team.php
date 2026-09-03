<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'course_id',
        'academic_year_id',
        'max_members',
        'created_by_user_id',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'team_members')
                    ->withPivot('role_in_team', 'joined_at')
                    ->withTimestamps();
    }

    public function topics()
    {
        return $this->hasMany(Topic::class);
    }

    public function approvedTopic()
    {
        return $this->hasOne(Topic::class)->where('status', 'approved');
    }

    public function supervision()
    {
        return $this->hasOne(Supervision::class);
    }

    public function softwareDeliverable()
    {
        return $this->hasOne(SoftwareDeliverable::class);
    }
}
