import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { LabeledInput } from "@/Components/ui/input"
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import deleteUserFormSchema from '@/Validation/deleteUserFormSchema';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function DeleteUserForm({
    onClose,
    className,
    ...props
}) {
    const { t } = useTranslation();

    const { register, formState: { errors }, getValues, setValue, handleSubmit, watch, setError, reset } = useForm({
        defaultValues: {
            password: '',
        },
        resolver: yupResolver(deleteUserFormSchema)
    });

    const onSubmit = async (e) => {
        await axios.post(route('profile.destroy'), e)
            .then(res => {
                onClose();
                reset();
                router.visit(route('login'));
            })
            .catch(err => {
                if (err.response.status === 422) {
                    Object.keys(err.response.data.errors).forEach((key) => {
                        setError(key, { type: 'manual', message: err.response.data.errors[key] });
                    })
                } else {
                    toast({
                        title: t('pages.error_deleting_account'),
                        variant: 'destructive',
                        duration: 3000,
                    });
                }
            });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='destructive'>
                    {t('pages.delete_account')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('pages.sure_delete_account')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('pages.delete_account_text')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mt-6">
                        <LabeledInput label={t('pages.password')} id="password" type="password" placeholder={t('pages.password')} errors={errors} {...register("password")} required />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="submit" variant='destructive' className="ms-3">
                            {t('pages.delete_account')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
