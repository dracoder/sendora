import { t } from 'i18next';
import { string, object } from 'yup';

const organizationFormSchema = object().shape({
    receiver: string().nullable().optional().email(t('validation.email')),
    name: string().required(t('validation.required', { field: t('pages.name') })),
    email: string().nullable().optional(),
    phone: string().nullable().optional(),
    owner_name: string().nullable().optional(),
    settings: object().shape({
        daily_limit: string().nullable().optional(),
        smtp: object().shape({
            host: string().nullable().optional(),
            port: string().nullable().optional(),
            encryption: string().nullable().optional(),
            username: string().nullable().optional(),
            password: string().nullable().optional(),
            from_email: string().nullable().optional().email(t('validation.email')),
            from_name: string().nullable().optional(),
        })
    })
});

export default organizationFormSchema;
