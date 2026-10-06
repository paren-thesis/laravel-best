<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    /**
     * Record an audit log entry.
     *
     * @param string $action Action name (e.g. 'topic.approved', 'user.login')
     * @param string $description Human readable summary of the event
     * @param Model|null $auditable Related Eloquent model instance
     * @param array|null $payload Optional contextual metadata
     * @return AuditLog
     */
    public static function log(string $action, string $description, ?Model $auditable = null, ?array $payload = []): AuditLog
    {
        $request = request();

        return AuditLog::create([
            'user_id' => auth()->id() ?? null,
            'action' => $action,
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable ? $auditable->getKey() : null,
            'description' => $description,
            'payload' => $payload ?? [],
            'ip_address' => $request ? $request->ip() : null,
            'user_agent' => $request ? substr($request->userAgent() ?? '', 0, 500) : null,
        ]);
    }
}
