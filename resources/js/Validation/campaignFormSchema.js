import { t } from 'i18next';
import { string, object, number, boolean, array } from 'yup';

const campaignFormSchema = object().shape({
    name: string().required(t('validation.required', { field: t('pages.name') })),
    organization_id: number().required(t('validation.required', { field: t('pages.organization') })),
    template_id: number().required(t('validation.required', { field: t('pages.template') })),
    start_at: string().optional().nullable(),
    // tags
    is_active: boolean().required(t('validation.required', { field: t('pages.is_active') })),
    emails: array().of(object().shape({
        title: string().required(t('validation.required', { field: t('pages.title') })),
        delay_value: number().optional().nullable(),
        delay_unit: string().optional().nullable(),
        is_active: boolean().required(t('validation.required', { field: t('pages.is_active') })),
        subject: string().required(t('validation.required', { field: t('pages.subject') })),
        content: string().required(t('validation.required', { field: t('pages.content') })),
    })).required(t('validation.required', { field: t('pages.emails') })),
    skip_dates: array().of(object().shape({
        from: string().required(t('validation.required', { field: t('pages.from') })),
        to: string().required(t('validation.required', { field: t('pages.to') })),
    })).optional().nullable(),
});

export default campaignFormSchema;
