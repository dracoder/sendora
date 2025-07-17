import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { LabeledInput } from '@/Components/ui/input';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import LoadingButton from '@/Components/LoadingButton';
import { useState } from 'react';
import axios from 'axios';
import { Badge } from '@/Components/ui/badge';
import EmailService from '@/Services/EmailService';

export default function EmailSend({ emailId, open, onOpenChange }) {
    const { t, i18n } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control } = useForm({
        defaultValues: {
            receiver: ''
        },
        resolver: yupResolver(object().shape({
            receiver: string().required(t('validation.required', { field: t('pages.email') })).email(t('validation.email', { field: t('pages.email') }))
        }))
    });

    const [loading, setLoading] = useState(false);

    const handleSendAction = async (data) => {
        setLoading(true);
        await EmailService.test(
            emailId,
            { receiver: data.receiver, lang: i18n.language },
            (response) => {
                toast({
                    title: t('pages.email') + ' ' + t('pages.sent'),
                    duration: 3000
                });
                setLoading(false);
                reset();
                onOpenChange(false);
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('pages.test') + ' ' + t('pages.email')}</DialogTitle>
                </DialogHeader>
                <Badge variant={'secondary'} className={'p-2'}>This is going to send only the saved changes!</Badge>
                <LabeledInput
                    label={t('pages.email')}
                    name="receiver"
                    id="receiver"
                    type="email"
                    {...register('receiver')}
                    errors={errors}
                    required
                />
                <div className="mt-6 flex justify-end">
                    <LoadingButton loading={loading} t={t} onClick={handleSubmit(handleSendAction)}>{t('pages.send')}</LoadingButton>
                </div>
            </DialogContent>
        </Dialog>
    )
}
