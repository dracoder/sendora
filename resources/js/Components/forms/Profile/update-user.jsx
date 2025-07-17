import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

import { Button } from "@/Components/ui/button"
import { LabeledInput } from "@/Components/ui/input"
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import updateUserFormSchema from '@/Validation/updateUserFormSchema';
import { useTranslation } from 'react-i18next';

export default function UpdateUserForm({
    className,
    ...props
}) {
    const { t } = useTranslation();
    const user = usePage().props.user;

    const { register, formState: { errors }, getValues, setValue, handleSubmit, watch } = useForm({
        defaultValues: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        },
        resolver: yupResolver(updateUserFormSchema)
    });

    const onSubmit = (e) => {
        router.visit(route('profile.update'), {
            method: 'patch',
            data: e,
            onSuccess: () => {
                toast({
                    title: t('pages.updated', { name: t('layout.profile') }),
                    duration: 3000
                });
            },
            onError: (errors) => {
                toast({
                    title: t('pages.error_updating_profile'),
                    type: 'destructive',
                    duration: 3000
                })
            },
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div className="mt-6 flex gap-x-2">
                <LabeledInput label={t('pages.first_name')} id="first_name" type="text" errors={errors} {...register("first_name")} required divClassName="w-full" />

                <LabeledInput label={t('pages.last_name')} id="last_name" type="text" errors={errors} {...register("last_name")} divClassName="w-full" />
            </div>
            <div className="mt-6">
                <LabeledInput label={t('pages.email')} id="email" type="email" errors={errors} {...register("email")} required />
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="submit" className="ms-3">
                    {t('pages.save')}
                </Button>
            </div>
        </form >
    )
}
