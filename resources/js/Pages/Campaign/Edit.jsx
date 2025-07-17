import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CampaignService from '@/Services/CampaignService';
import { Form, defaultValues } from '@/Components/forms/Campaign/form';
import { Button } from '@/Components/ui/button';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import campaignFormSchema from '@/Validation/campaignFormSchema';
import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Edit({ campaignData }) {
    const campaign = campaignData.data;
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(campaignFormSchema)
    });

    useEffect(() => {
        if (!campaign.id) return;
        // sorting campaign emails by their step
        campaign.emails.sort((a, b) => a.step - b.step);
        reset(campaign);
    }, [campaign.id]);

    const handleUpdateAction = (data) => {
        CampaignService.update(campaign.id, data, () => {
            toast({
                title: t('pages.updated', { name: t('pages.campaign') }),
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
                { name: t('pages.edit', { name: t('pages.campaign') }), href: route('campaigns.edit', campaign.id), current: true }
            ]}
            title="Edit Campaign"
        >
            <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(handleUpdateAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} setValue={setValue} />

                    <div className="mt-6 flex justify-end">
                        <Button type="submit">{t('pages.save')}</Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    )
}
