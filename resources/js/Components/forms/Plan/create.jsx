import PlanService from '@/Services/PlanService';
import { Form, defaultValues } from './form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/Components/ui/button';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import planFormSchema from '@/Validation/planFormSchema';
import { useTranslation } from 'react-i18next';
import LoadingButton from '@/Components/LoadingButton';

export default function CreateForm({ onSubmit, open, onOpenChange }) {
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(planFormSchema)
    });
    const [loading, setLoading] = useState(false);

    const handleStoreAction = (data) => {
        setLoading(true);
        const formData = {
            ...data,
            user_ids: data.is_private ? data.user_ids : [],
            monthly_credits: Number(data.monthly_credits)
        };
        
        PlanService.store(formData, 
            () => {
                toast({
                    title: t('pages.created', { name: t('pages.plan') }),
                    duration: 3000
                });
                reset();
                onOpenChange(false);
                onSubmit();
                setLoading(false);
            },
            (error) => {
                toast({
                    title: t('components.error'),
                    description: error.message || t('pages.create_failed'),
                    variant: 'destructive',
                    duration: 3000
                });
                setLoading(false);
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('pages.create', { name: t('pages.plan') })}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleStoreAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} setValue={setValue} />

                    <div className="mt-6 flex justify-end">
                        <LoadingButton t={t} loading={loading} type="submit">{t('pages.save')}</LoadingButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
