<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'title',
        'abstract',
        'problem_statement',
        'proposed_solution',
        'tech_stack',
        'status',
        'review_notes',
        'submitted_at',
        'reviewed_at',
        'reviewed_by_user_id',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
