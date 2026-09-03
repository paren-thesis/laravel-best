<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RubricCriteria extends Model
{
    use HasFactory;

    protected $table = 'rubric_criteria';

    protected $fillable = [
        'rubric_id',
        'title',
        'description',
        'max_points',
        'weight_percentage',
    ];

    public function rubric()
    {
        return $this->belongsTo(Rubric::class);
    }
}
