<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Lang;

class SmtpMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(protected $organizationName) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: Lang::get('messages.smtp.subject', ['organization' => $this->organizationName]),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.smtp',
            with: [
                'greeting' => Lang::get('messages.smtp.greeting'),
                'intro_line' => Lang::get('messages.smtp.intro_line', ['organization' => $this->organizationName]),
                'outro_line' => Lang::get('messages.smtp.outro_line'),
                'salutation' => Lang::get('messages.smtp.salutation'),
            ],
        );
    }
}
