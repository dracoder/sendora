<?php
return [
    'reset_password_notification' => 'Notifica di reimpostazione della password',
    'password_reset_request' => 'Stai ricevendo questa email perché abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account.',
    'reset_password' => 'Reimposta la password',
    'password_reset_expiry' => 'Questo link di reimpostazione della password scadrà tra :count minuti.',
    'didnt_request_password_exception' => 'Se non hai richiesto una reimpostazione della password, non è richiesta alcuna ulteriore azione.',

    'login_instructions' => 'Istruzioni di accesso',
    'welcome_to_sendora' => 'Benvenuto in Sendora! Questo è il tuo primo accesso. Si prega di creare la password per accedere.',
    'create_password' => 'Crea la password',
    'didnt_create_accout_exception' => 'Se non hai creato un account, non è richiesta alcuna ulteriore azione.',

    'existing_email_of_subscriber_in_organization' => 'Il sottoscrittore con la stessa email esiste già in questa organizzazione',

    'smtp' => [
        'subject' => ':organization - Email di prova',
        "greeting" => "Ciao!",
        "intro_line" => "Questa è una email di prova da :organization.",
        "outro_line" => "Grazie per aver utilizzato la nostra applicazione!",
        "salutation" => "Saluti",
    ],

    'unsubscribe_error' => 'Annullamento della sottoscrizione non riuscito.',
    'unsubscribe_success' => 'Ti sei disiscritto con successo.',
    'unsubscribe_message' => "Ci dispiace vederti andare. Non riceverai più email da noi.",
    'unsubscribe_error_message' => 'Si è verificato un errore durante l\'annullamento della sottoscrizione. Riprova più tardi.',

    'current_plan' => 'Piano attuale',
    'switch_to_this_plan' => 'Passa a questo piano',
    'get_started' => 'Inizia',

    'hello' => 'Ciao',
    "subscription_mails" => [
        "payment_failed" => [
            "subject" => "Ops - Il tuo pagamento è fallito",
            "description" => "Il tuo pagamento è fallito. Si prega di aggiornare il metodo di pagamento per continuare a utilizzare le funzionalità premium.",
            "pay_btn" => "Paga ora",
        ],
    ],
    "active_subcsription_required" => "È richiesto un abbonamento attivo",
    "package_not_active" => "Il pacchetto non è attivo",
    "failed_to_create_payment_intent" => "Impossibile creare l'intento di pagamento",
    "payment_intent_not_succeeded" => "L'intento di pagamento non è andato a buon fine",
    "purchase_confirmed" => "Acquisto confermato",
    "failed_to_confirm_purchase" => "Impossibile confermare l'acquisto",
    "purchased_successfully" => "Acquistato con successo",
    "created_successfully" => "Creato con successo",
    "updated_successfully" => "Aggiornato con successo",
    "deleted_successfully" => "Eliminato con successo",
    "package_credit" => "Crediti pacchetto",
    "subscription_credit" => "Crediti abbonamento",
    "purchase" => "Acquisto",
    "usage" => "Utilizzo",
    "insufficient_credits" => "Crediti insufficienti",
    "credit_deduction_failed" => "Ritiro di crediti fallito",
    'active' => 'Attivo',
    'inactive' => 'Inattivo',
    'no_credits_campaign_warning' => 'Crediti insufficienti. Acquistare altri crediti per continuare a utilizzare la campagna.'
];
