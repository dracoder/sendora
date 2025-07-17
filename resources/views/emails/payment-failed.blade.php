@component('mail::message',['logo'=>(!empty($logo) ? $logo : null)])
<p>{{ __('messages.hello') }} {{ $user->name}},</p>
<p>
    {{ __('messages.subscription_mails.payment_failed.description') }}
</p>

@component('mail::button', ['url' => $invoice->hosted_invoice_url])
    {{ __('messages.subscription_mails.payment_failed.pay_btn') }}
@endcomponent

@endcomponent
