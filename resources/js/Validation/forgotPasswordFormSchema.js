import { t } from 'i18next';
import { string, object } from 'yup';

const forgotPasswordFormSchema = object().shape({
    email: string().required(t('validation.required', { field: t('pages.email') })).email(t('validation.email', { field: t('pages.email') })),
});

export default forgotPasswordFormSchema;
