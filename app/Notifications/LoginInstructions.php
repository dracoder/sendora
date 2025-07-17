<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\URL;

class LoginInstructions extends Notification
{
    /**
     * The callback that should be used to create the verify email URL.
     *
     * @var \Closure|null
     */
    public static $createUrlCallback;

    /**
     * The callback that should be used to build the mail message.
     *
     * @var \Closure|null
     */
    public static $toMailCallback;

    /**
     * Get the notification's channels.
     *
     * @param  mixed  $notifiable
     * @return array|string
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $url = route('first-login', $notifiable->remember_token);

        return $this->buildMailMessage($url);
    }

    /**
     * Get the verify email notification mail message for the given URL.
     *
     * @param  string  $url
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject(Lang::get('messages.login_instructions'))
            ->line(Lang::get('messages.welcome_to_sendora'))
            ->action(Lang::get('messages.create_password'), $url)
            ->line(Lang::get('messages.didnt_create_accout_exception'));
    }

    /**
     * Get the verification URL for the given notifiable.
     *
     * @param  string  $token
     * @return string
     */
    protected function verificationUrl($token)
    {
        return URL::createUrlUsing(
            'first-login',
            [
                'token' => $token,
            ]
        );
    }
}
