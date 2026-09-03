<?php

namespace App\Events;

use App\Models\Topic;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TopicStatusUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Topic $topic)
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
        return 'topic.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->topic->id,
            'title' => $this->topic->title,
            'status' => $this->topic->status,
            'team_name' => $this->topic->team?->name ?? 'Team',
            'message' => "Proposal '{$this->topic->title}' marked as {$this->topic->status}",
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
