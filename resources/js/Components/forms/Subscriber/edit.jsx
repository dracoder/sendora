import SubscriberService from '@/Services/SubscriberService';
import { Form, defaultValues } from './form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/Components/ui/button';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import subscriberFormSchema from '@/Validation/subscriberFormSchema';
import { useTranslation } from 'react-i18next';

export default function EditForm({ onSubmit, open, onOpenChange, editingId }) {
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(subscriberFormSchema)
    });

    useEffect(() => {
        if (!editingId) return;
        SubscriberService.show(editingId, (data) => {
            reset(data);
        });
    }, [editingId]);

    const handleUpdateAction = (data) => {
        SubscriberService.update({
            id: editingId,
            data: data,
            onSuccess: () => {
                toast({
                    title: t('pages.updated', { name: t('pages.subscriber') }),
                    duration: 3000
                });
                reset();
                onOpenChange(false);
                onSubmit();
            },
            onError: (error) => {
                toast({
                    title: error.message,
                    type: 'destructive'
                });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle>{t('pages.edit', { name: t('pages.subscriber') })} #{editingId}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleUpdateAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} />

                    <div className="mt-6 flex justify-end">
                        <Button type="submit">{t('pages.save')}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
