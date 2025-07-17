<?php
return [
    'reset_password_notification' => 'Reset Password Notification',
    'password_reset_request' => 'You are receiving this email because we received a password reset request for your account.',
    'reset_password' => 'Reset Password',
    'password_reset_expiry' => 'This password reset link will expire in :count minutes.',
    'didnt_request_password_exception' => 'If you did not request a password reset, no further action is required.',

    'login_instructions' => 'Login Instructions',
    'welcome_to_sendora' => 'Welcome to Sendora! This is your first login. Please create your password to login.',
    'create_password' => 'Create Password',
    'didnt_create_accout_exception' => 'If you did not create an account, no further action is required.',

    'existing_email_of_subscriber_in_organization' => 'Subscriber with the same email already exists in this organization',

    'smtp' => [
        'subject' => ':organization - Test Email',
        "greeting" => "Hello!",
        "intro_line" => "This is a test email from :organization.",
        "outro_line" => "Thank you for using our application!",
        "salutation" => "Regards",
    ],

    'unsubscribe_error' => 'Unsubscribe failed.',
    'unsubscribe_success' => 'You have successfully unsubscribed.',
    'unsubscribe_message' => "We're sorry to see you go. You will no longer receive emails from us.",
    'unsubscribe_error_message' => 'An error occurred while unsubscribing. Please try again later.',

    'current_plan' => 'Current Plan',
    'switch_to_this_plan' => 'Switch to this Plan',
    'get_started' => 'Get Started',

    'hello' => 'Hello',
    "subscription_mails" => [
        "payment_failed" => [
            "subject" => "Ops - Your payment has failed",
            "description" => "Your payment has failed. Please update your payment method to continue using the premium features.",
            "pay_btn" => "Pay now",
        ],
    ],
    "active_subcsription_required" => "Active subscription required",
    "package_not_active" => "Package not active",
    "failed_to_create_payment_intent" => "Failed to create payment intent",
    "payment_intent_not_succeeded" => "Payment intent not succeeded",
    "purchase_confirmed" => "Purchase confirmed",
    "failed_to_confirm_purchase" => "Failed to confirm purchase",
    "purchased_successfully" => "Purchased successfully",
    "created_successfully" => "Created successfully",
    "updated_successfully" => "Updated successfully",
    "deleted_successfully" => "Deleted successfully",
    "package_credit" => "Package credit",
    "subscription_credit" => "Subscription credit",
    "purchase" => "Purchase",
    "usage" => "Usage",
    "insufficient_credits" => "Insufficient credits",
    "credit_deduction_failed" => "Credit deduction failed",
    'active' => 'Active',
    'inactive' => 'Inactive',
    'no_credits_campaign_warning' => 'Insufficient credits. Please purchase more credits to continue using the campaign.'
];
