import { t } from 'i18next';
import { string, object, boolean } from 'yup';

const userFormSchema = object().shape({
    role: string().required(t('validation.required', { field: t('pages.role') })),
    is_affiliate: boolean().required(t('validation.required', { field: t('pages.is_affiliate') })),
    first_name: string().required(t('validation.required', { field: t('pages.first_name') })),
    last_name: string().nullable().optional(),
    email: string().required(t('validation.required', { field: t('pages.email') })),
});

export default userFormSchema;
