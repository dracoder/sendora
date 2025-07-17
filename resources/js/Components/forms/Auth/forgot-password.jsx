import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { LabeledInput } from "@/Components/ui/input"
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import forgotPasswordFormSchema from '@/Validation/forgotPasswordFormSchema';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useState } from 'react';
import LoadingButton from '@/Components/LoadingButton';

export function ForgotPasswordForm({
    className,
    ...props
}) {
    const { t } = useTranslation();
    const { register, formState: { errors }, getValues, setValue, handleSubmit, watch, setError, reset } = useForm({
        defaultValues: {
            email: '',
        },
        resolver: yupResolver(forgotPasswordFormSchema)
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        setLoading(true);
        await axios.post(route('password.email'), e)
            .then(res => {
                toast({
                    title: 'Password Reset Link Sent',
                    duration: 3000
                });
                setLoading(false);
                reset();
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
                setLoading(false);
            })
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('pages.forgot_password')}?</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    {t('pages.forgot_password_text_1')}<br />
                    {t('pages.forgot_password_text_2')}
                    {t('pages.forgot_password_text_3')}.
                </p>
            </div>
            <div className="grid gap-6">
                <LabeledInput label={t('pages.email')} id="email" type="email" errors={errors} {...register("email")} required />

                <LoadingButton type="submit" className="w-full" loading={loading} t={t}>{t('pages.send_reset_link')}</LoadingButton>
            </div>
        </form>
    )
}
