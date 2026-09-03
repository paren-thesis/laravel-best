<?php

namespace App\Exports;

use App\Models\Team;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BroadsheetExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Team::with(['course', 'members', 'approvedTopic', 'supervision.supervisor'])->get();
    }

    public function headings(): array
    {
        return [
            'Team ID',
            'Team Name',
            'Course Code',
            'Course Name',
            'Team Members',
            'Approved Project Topic',
            'Assigned Supervisor',
            'Status',
        ];
    }

    public function map($team): array
    {
        $membersList = $team->members->map(function ($m) {
            return $m->name . ' (' . ($m->profile?->index_number ?? 'N/A') . ')';
        })->join('; ');

        return [
            $team->id,
            $team->name,
            $team->course?->code ?? 'N/A',
            $team->course?->name ?? 'N/A',
            $membersList,
            $team->approvedTopic?->title ?? 'No Approved Topic',
            $team->supervision?->supervisor?->name ?? 'Unassigned',
            $team->approvedTopic ? 'Active' : 'Pending Approval',
        ];
    }
}
