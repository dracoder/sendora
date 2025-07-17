import { t } from 'i18next';
import { string, object, number, boolean, array } from 'yup';

const subscriberFormSchema = object().shape({
    title: string().nullable().optional(),
    is_subscribed: boolean().required(t('validation.required', { field: t('pages.is_subscribed') })),
    first_name: string().nullable().optional(),
    last_name: string().nullable().optional(),
    email: string().email(t('validation.email')).required(t('validation.required', { field: t('pages.email') })),
    phone: string().nullable().optional(),
    organization_id: string()
        .notOneOf(['0'], t('validation.required', { field: t('pages.organization') }))
        .required(t('validation.required', { field: t('pages.organization') })),
    tag_ids: array().of(number()).required(t('validation.required', { field: t('menu.tags') })),
    email_status: string().nullable().optional(),
    company: string().nullable().optional(),
    industry: string().nullable().optional(),
    location: string().nullable().optional(),
   // profile_picture: string().nullable().optional().url(t('validation.url')),
    linkedin_url: string().nullable().optional().url(t('validation.url')),
    note: string().nullable().optional(),
});

export default subscriberFormSchema;
