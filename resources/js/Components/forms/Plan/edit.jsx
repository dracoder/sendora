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

export default function EditForm({ onSubmit, open, onOpenChange, editingId }) {
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(planFormSchema)
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!editingId) return;
        PlanService.show(editingId, (data) => {
            if (!data.frequency) data.frequency = 'monthly';
            if (data.is_custom_price === undefined) data.is_custom_price = false;
            if (data.is_private === undefined) data.is_private = false;
            if (!data.price) data.price = '';
            if (!data.price_per_unit) data.price_per_unit = '';
            if (data.monthly_credits === null) data.monthly_credits = 0;
            if (!data.features) data.features = [];
            if (!data.user_ids) data.user_ids = [];
            
            reset(data);
        });
    }, [editingId]);

    const handleUpdateAction = (data) => {
        setLoading(true);
        
        if (data.monthly_credits !== '' && data.monthly_credits !== null) {
            data.monthly_credits = Number(data.monthly_credits);
        }
        
        const formData = {
            ...data,
            user_ids: data.is_private ? data.user_ids : [],
        };
        
        const planId = editingId ? editingId.toString().trim() : null;
        if (!planId) {
            toast({
                title: t('components.error'),
                description: t('pages.invalid_id'),
                variant: 'destructive',
                duration: 3000
            });
            setLoading(false);
            return;
        }
        
        PlanService.update(planId, formData, 
            (response) => {
                toast({
                    title: t('pages.updated', { name: t('pages.plan') }),
                    duration: 3000
                });
                reset();
                onOpenChange(false);
                onSubmit();
                setLoading(false);
            },
            (error) => {
                console.error("Update failed:", error);
                toast({
                    title: t('components.error'),
                    description: error.message || t('pages.update_failed'),
                    variant: 'destructive',
                    duration: 3000
                });
                setLoading(false);
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('pages.edit', { name: t('pages.plan') })} #{editingId}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleUpdateAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} setValue={setValue} isEditing />

                    <div className="mt-6 flex justify-end">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="mr-2"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('components.cancel')}
                        </Button>
                        <LoadingButton t={t} loading={loading} type="submit">{t('pages.save')}</LoadingButton>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
