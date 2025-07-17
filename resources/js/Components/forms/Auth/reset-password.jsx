import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { LabeledInput } from "@/Components/ui/input"
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import resetPasswordFormSchema from '@/Validation/resetPasswordFormSchema';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export function ResetPasswordForm({
    token,
    email,
    className,
    ...props
}) {
    const { t } = useTranslation();
    const { register, formState: { errors }, getValues, setValue, handleSubmit, watch, setError } = useForm({
        defaultValues: {
            token: token,
            email: email,
            password: '',
            password_confirmation: '',
        },
        resolver: yupResolver(resetPasswordFormSchema)
    });

    const onSubmit = async (e) => {
        await axios.post(route('password.store'), e)
            .then(res => {
                toast({
                    title: t('pages.password_reset'),
                    description: t('pages.password_reset_success'),
                    duration: 3000
                })

                router.visit(route('login'));
            })
            .catch(err => {
                if (err.response.status === 422) {
                    Object.keys(err.response.data.errors).forEach((key) => {
                        setError(key, { type: 'manual', message: err.response.data.errors[key] });
                    })
                } else {
                    toast({
                        title: 'Error',
                        message: t('validation.try_again'),
                        variant: 'destructive',
                        duration: 3000,
                    })
                }
            })
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('pages.reset_password')}</h1>
            </div>
            <div className="grid gap-6">
                <LabeledInput label={t('pages.email')} id="email" type="email" errors={errors} {...register("email")} required />

                <LabeledInput label={t('pages.password')} id="password" type="password" errors={errors} {...register("password")} required />

                <LabeledInput label={t('pages.confirm_password')} id="password_confirmation" type="password" errors={errors} {...register("password_confirmation")} required />

                <Button type="submit" className="w-full">
                    {t('pages.reset_password')}
                </Button>
            </div>
        </form>
    )
}
