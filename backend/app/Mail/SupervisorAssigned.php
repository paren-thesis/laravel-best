<?php

namespace App\Mail;

use App\Models\Supervision;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupervisorAssigned extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Supervision $supervision)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Supervisor Allocation Notice: Team {$this->supervision->team->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <h2>Project Supervisor Allocation Notice</h2>
                <p>Team <strong>{$this->supervision->team->name}</strong> has been allocated to supervisor <strong>{$this->supervision->supervisor->name}</strong>.</p>
                <p>Please log in to your FYP portal to view research guidance instructions.</p>
                <br>
                <p>Ho Technical University — Computer Science Department</p>
            "
        );
    }
}
