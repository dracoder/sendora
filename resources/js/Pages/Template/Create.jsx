import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TemplateService from '@/Services/TemplateService';
import { Form, defaultValues } from '@/Components/forms/Template/form';
import { Button } from '@/Components/ui/button';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import templateFormSchema from '@/Validation/templateFormSchema';
import VariablesAndConditions from '@/Components/VariablesAndConditions';
import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function Create({ }) {
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(templateFormSchema)
    });

    const handleStoreAction = (data) => {
        TemplateService.store(data, () => {
            toast({
                title: t('pages.created', { name: t('pages.template') }),
                duration: 3000
            });
            reset();

            router.visit(route('templates.index'));
        });
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.templates'), href: route('templates.index') },
                { name: t('pages.create', { name: t('pages.template') }), href: route('templates.create'), current: true }
            ]}
            title={t('pages.create', { name: t('pages.template') })}
        >
            <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(handleStoreAction)}>
                    <Form register={register} errors={errors} watch={watch} control={control} setValue={setValue} />

                    <div className="mt-6 flex justify-end">
                        <Button type="submit">{t('pages.save')}</Button>
                    </div>
                </form>
                <VariablesAndConditions isTemplate />
            </div>
        </AuthenticatedLayout>
    )
}
