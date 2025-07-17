import { t } from 'i18next';
import { string, object, ref } from 'yup';

const updatePasswordFormSchema = object().shape({
    current_password: string()
        .required(t('validation.required', { field: t('pages.current_password') })),
    password: string()
        .required(t('validation.required', { field: t('pages.new_password') }))
        .min(8, t('validation.min', { field: t('pages.password'), min: 8 })),
    password_confirmation: string()
        .required(t('validation.required', { field: t('pages.password_confirmation') }))
        .min(8, t('validation.min', { field: t('pages.password'), min: 8 }))
        .oneOf([ref('password'), null], t('validation.password_mismatch')),
});

export default updatePasswordFormSchema;
