<x-mail::message>
    {{ $greeting }}

    {{ $intro_line }}

    {{ $outro_line }}

    {{ $salutation }},
    {{ config('app.name') }}
</x-mail::message>
