<?php

namespace App\Http\Controllers\Api;

use App\Exports\BroadsheetExport;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function exportBroadsheetCsv()
    {
        return Excel::download(new BroadsheetExport, 'htu_fyp_broadsheet.csv');
    }

    public function exportBroadsheetPdf()
    {
        $teams = Team::with(['course', 'members.profile', 'approvedTopic', 'supervision.supervisor'])->get();

        $pdf = Pdf::loadView('pdf.broadsheet', [
            'teams' => $teams,
            'generated_at' => now()->format('d M Y, h:i A'),
        ]);

        return $pdf->download('htu_fyp_broadsheet.pdf');
    }
}
