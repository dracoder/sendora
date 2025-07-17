import placeholderImage from '/resources/images/placeholder.jpg'
import logoImage from '/resources/images/logo.png'
import LangSwitcher from "@/Components/LangSwitcher"
import { ThemeToggle } from "@/Components/ThemeToggle"
import { usePage } from '@inertiajs/react';

export default function AuthLayout({ children }) {
    const page = usePage();
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-col items-center md:flex-row justify-center gap-x-2 gap-y-4 md:justify-between">
                    <a href={route('login')} className="flex items-center gap-2 font-medium">
                        <img
                            src={logoImage}
                            alt="Logo"
                            className="size-10"
                        />
                        {page.props.appName}
                    </a>
                    <div className="flex items-center gap-4">
                        <LangSwitcher />

                        <ThemeToggle />
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        {children}
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src={placeholderImage}
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
