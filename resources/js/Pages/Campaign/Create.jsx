import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CampaignService from '@/Services/CampaignService';
import { Form, defaultValues } from '@/Components/forms/Campaign/form';
import { Button } from '@/Components/ui/button';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import campaignFormSchema from '@/Validation/campaignFormSchema';
import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function Create({ }) {
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(campaignFormSchema)
    });

    const handleStoreAction = (data) => {
        CampaignService.store(data, () => {
            toast({
                title: t('pages.created', { name: t('pages.campaign') }),
                duration: 3000
            });
            reset();

            router.visit(route('campaigns.index'));
        });
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.campaigns'), href: route('campaigns.index') },
                { name: t('pages.create', { name: t('pages.campaign') }), href: route('campaigns.create'), current: true }
            ]}
            title={t('pages.create', { name: t('pages.campaign') })}
        >
            <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(handleStoreAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} setValue={setValue} />

                    <div className="mt-6 flex justify-end">
                        <Button type="submit">{t('pages.save')}</Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    )
}
