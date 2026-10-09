<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,name,email');

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user ID
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search in description or payload
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Date range filtering
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $perPage = min((int) ($request->per_page ?? 15), 100);
        $auditLogs = $query->latest()->paginate($perPage);

        return response()->json($auditLogs);
    }
}
