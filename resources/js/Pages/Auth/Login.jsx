import AuthLayout from "@/Layouts/AuthLayout"
import { LoginForm } from "@/Components/forms/Auth/login"

export default function Login() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    )
}
