import AuthLayout from '@/Layouts/AuthLayout';
import { RegisterForm } from "@/Components/forms/Auth/register"

export default function Register() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
