import { t } from 'i18next';
import { string, object, ref } from 'yup';

const loginFormSchema = object().shape({
    token: string().required(t('validation.required', { field: t('pages.token') })),
    email: string().required(t('validation.required', { field: t('pages.email') })).email(t('validation.email')),
    password: string()
        .required(t('validation.required', { field: t('pages.password') }))
        .min(8, t('validation.min', { field: t('pages.password'), min: 8 })),
    password_confirmation: string()
        .required(t('validation.required', { field: t('pages.password_confirmation') }))
        .min(8, t('validation.min', { field: t('pages.password'), min: 8 }))
        .oneOf([ref('password'), null], t('validation.password_mismatch'))
});

export default loginFormSchema;
