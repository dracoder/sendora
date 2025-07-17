import AuthLayout from '@/Layouts/AuthLayout';
import { ForgotPasswordForm } from '@/Components/forms/Auth/forgot-password';

export default function ForgotPassword({ }) {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
