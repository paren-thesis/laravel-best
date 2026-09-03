<?php

namespace App\Mail;

use App\Models\Topic;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TopicStatusChanged extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Topic $topic)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "FYP Proposal Status Update: {$this->topic->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <h2>FYP Topic Proposal Review Update</h2>
                <p>Your proposal <strong>{$this->topic->title}</strong> has been reviewed by the Department Coordinator.</p>
                <p>Status: <strong style='text-transform: uppercase; color: #4f46e5;'>{$this->topic->status}</strong></p>
                <p>Review Notes: {$this->topic->review_notes}</p>
                <br>
                <p>Ho Technical University — Computer Science Department</p>
            "
        );
    }
}
