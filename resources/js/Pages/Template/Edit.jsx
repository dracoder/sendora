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
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Edit({ templateData }) {
    const template = templateData.data;
    const { t } = useTranslation();
    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(templateFormSchema)
    });

    useEffect(() => {
        if (!template.id) return;
        reset(template);
    }, [template.id]);

    const handleUpdateAction = (data) => {
        TemplateService.update(template.id, data, () => {
            toast({
                title: t('pages.updated', { name: t('pages.template') }),
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
                { name: t('pages.edit', { name: t('pages.template') }), href: route('templates.edit', template.id), current: true }
            ]}
            title="Edit Template"
        >
            <div className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(handleUpdateAction)}>
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
