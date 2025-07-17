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
import { use, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import subscriberFormSchema from '@/Validation/subscriberFormSchema';
import { useTranslation } from 'react-i18next';

export default function CreateForm({ onSuccess, open, onOpenChange, campaignId }) {
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control } = useForm({
        defaultValues: campaignId ? {...defaultValues, campaign_id: campaignId} : defaultValues,
        resolver: yupResolver(subscriberFormSchema)
    });

    const handleStoreAction = (data) => {
        if (campaignId) {
            data.campaign_id = campaignId;
        }
        
        SubscriberService.store({
            data: data,
            onSuccess: () => {
                toast({
                    title: t('pages.created', { name: t('pages.subscriber') }),
                    duration: 3000
                });
                reset();
                onOpenChange(false);
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
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
                    <DialogTitle>{t('pages.create', { name: t('pages.subscriber') })}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleStoreAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} />

                    <div className="mt-6 flex justify-end">
                        <Button type="submit">{t('pages.save')}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
