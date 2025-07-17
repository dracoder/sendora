<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmailPreviewRequest;
use App\Http\Requests\EmailTestRequest;
use App\Http\Requests\EmailTestSmtpRequest;
use App\Mail\SmtpMail;
use App\Models\Email;
use App\Repositories\EmailRepository;

class EmailController extends Controller
{
    public function preview(Email $email, EmailPreviewRequest $request)
    {
        $emailRepository = new EmailRepository($email);
        $content = $emailRepository->generateFakeBody($request->lang == 'en' ? 'en_US' : 'it_IT');

        return response()->json(['content' => $content]);
    }

    public function test(Email $email, EmailTestRequest $request)
    {
        $emailRepository = new EmailRepository($email);
        $emailRepository->test($request->receiver, $request->lang == 'en' ? 'en_US' : 'it_IT');

        return response()->json(['message' => 'Email sent successfully']);
    }

    public function testSmtp(EmailTestSmtpRequest $request)
    {
        $mailer = custom_mailer($request->data);

        $mailer->to($request->receiver)
            ->send(new SmtpMail($request->organization_name));
    }
}
