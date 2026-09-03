<?php

namespace App\Events;

use App\Models\Supervision;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupervisorAssignedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Supervision $supervision)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('fyp-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'supervisor.assigned';
    }

    public function broadcastWith(): array
    {
        return [
            'team_id' => $this->supervision->team_id,
            'team_name' => $this->supervision->team?->name ?? 'Team',
            'supervisor_name' => $this->supervision->supervisor?->name ?? 'Supervisor',
            'message' => "Supervisor {$this->supervision->supervisor?->name} allocated to Team {$this->supervision->team?->name}",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
