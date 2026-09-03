<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DefensePanel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'scheduled_at',
        'location',
        'academic_year_id',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'defense_panel_members', 'panel_id', 'user_id')
                    ->withPivot('role')
                    ->withTimestamps();
    }
}
