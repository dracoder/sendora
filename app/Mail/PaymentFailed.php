<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailed extends Mailable
{
    use Queueable, SerializesModels;

    protected $user, $stripeInvoice;

    /**
     * Create a new message instance.
     */
    public function __construct($user, $stripeInvoice)
    {
        $this->user = $user;
        $this->stripeInvoice = $stripeInvoice;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $user = $this->user;
        $invoice = $this->stripeInvoice;
        if ($user->locale) {
            app()->setLocale($user->locale);
        }
        return $this->markdown('emails.payment-failed', ['user' => $user, 'invoice' => $invoice])
            ->subject(__('messages.subscription_mails.payment_failed.subject'))
            ->to($user->email, $user->name);
    }
}
