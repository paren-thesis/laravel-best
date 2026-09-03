<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HTU FYP Final Broadsheet Report</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #1e293b; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin: 0; color: #0f172a; }
        .header p { margin: 3px 0 0 0; color: #64748b; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; font-size: 10px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge { padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-approved { background-color: #dcfce7; color: #166534; }
        .badge-pending { background-color: #fef3c7; color: #92400e; }
        .footer { margin-top: 30px; text-align: right; font-size: 9px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HO TECHNICAL UNIVERSITY</h1>
        <p>Department of Computer Science — Final Year Project Broadsheet Report</p>
        <p>Generated on: {{ $generated_at }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Team Name</th>
                <th>Course</th>
                <th>Team Members</th>
                <th>Approved Topic Title</th>
                <th>Assigned Supervisor</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($teams as $index => $t)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $t->name }}</strong></td>
                    <td>{{ $t->course->code ?? 'N/A' }}</td>
                    <td>
                        @foreach($t->members as $m)
                            {{ $m->name }}@if(!$loop->last), @endif
                        @endforeach
                    </td>
                    <td>{{ $t->approvedTopic->title ?? 'No Approved Topic' }}</td>
                    <td>{{ $t->supervision->supervisor->name ?? 'Unassigned' }}</td>
                    <td>
                        @if($t->approvedTopic)
                            <span class="badge badge-approved">Approved</span>
                        @else
                            <span class="badge badge-pending">Pending</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Official Department Record • Ho Technical University</p>
    </div>
</body>
</html>
