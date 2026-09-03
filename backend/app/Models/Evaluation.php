<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'panel_id',
        'evaluator_id',
        'rubric_id',
        'rubric_criteria_id',
        'score',
        'comments',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function panel()
    {
        return $this->belongsTo(DefensePanel::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    public function rubric()
    {
        return $this->belongsTo(Rubric::class);
    }

    public function criteria()
    {
        return $this->belongsTo(RubricCriteria::class, 'rubric_criteria_id');
    }
}
