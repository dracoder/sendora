import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

import { Button } from "@/Components/ui/button"
import { LabeledInput } from "@/Components/ui/input"
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import updatePasswordFormSchema from '@/Validation/updatePasswordFormSchema';
import { useTranslation } from 'react-i18next';

export default function UpdatePasswordForm({
    className,
    ...props
}) {
    const { t } = useTranslation();
    const user = usePage().props.user;

    const { register, formState: { errors }, handleSubmit, reset } = useForm({
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
        resolver: yupResolver(updatePasswordFormSchema)
    });

    const onSubmit = (e) => {
        router.visit(route('password.update'), {
            method: 'put',
            data: e,
            onSuccess: () => {
                toast({
                    title: t('pages.updated', { name: t('pages.password') }),
                    duration: 3000
                });
                reset();
            },
            onError: (errors) => {
                toast({
                    title: t('pages.error_updating_password'),
                    type: 'destructive',
                    duration: 3000
                })

                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div className="mt-6">
                <LabeledInput label={t('pages.current_password')} id="current_password" type="password" errors={errors} {...register("current_password")} required />
            </div>
            <div className="mt-6">
                <LabeledInput label={t('pages.new_password')} id="password" type="password" errors={errors} {...register("password")} required />
            </div>
            <div className="mt-6">
                <LabeledInput label={t('pages.confirm_password')} id="password_confirmation" type="password" errors={errors} {...register("password_confirmation")} required />
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="submit" className="ms-3">
                    {t('pages.save')}
                </Button>
            </div>
        </form>
    )
}
