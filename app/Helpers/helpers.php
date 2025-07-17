<?php

use Illuminate\Mail\MailManager;

if (!function_exists('log_error')) {
    function log_error($exception, $dump = true)
    {
        if (config('app.env') == 'local' && $dump) {
            dd($exception);
        }
        \Illuminate\Support\Facades\Log::error($exception);
    }
}

if (!function_exists('custom_mailer')) {
    function custom_mailer($smtp)
    {
        $factory = new \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory();
        $transport = $factory->create(new \Symfony\Component\Mailer\Transport\Dsn(
            'smtp',
            $smtp['host'],
            $smtp['username'] ?? '',
            $smtp['password'] ?? '',
            $smtp['port'],
            [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ],
                'tls' => $smtp['encryption'] === 'tls',
            ]
        ));

        $mailer = app('mailer');
        $mailer->setSymfonyTransport($transport);
        if (isset($smtp['from_address']) && isset($smtp['from_name'])) {
            $mailer->alwaysFrom($smtp['from_address'], $smtp['from_name'] ?? null);
        }
        return $mailer;
    }
}
