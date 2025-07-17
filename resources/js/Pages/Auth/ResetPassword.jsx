import AuthLayout from '@/Layouts/AuthLayout';
import { ResetPasswordForm } from '@/Components/forms/Auth/reset-password';

export default function ResetPassword({ token, email }) {

    return (
        <AuthLayout>
            <ResetPasswordForm token={token} email={email} />
        </AuthLayout>
    );
}
