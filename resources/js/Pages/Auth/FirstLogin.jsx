import AuthLayout from '@/Layouts/AuthLayout';
import { FirstLoginForm } from '@/Components/forms/Auth/first-login';

export default function ResetPassword({ token, email }) {

    return (
        <AuthLayout>
            <FirstLoginForm token={token} />
        </AuthLayout>
    );
}
