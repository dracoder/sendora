import { t } from 'i18next';
import { string, object, number, boolean, array } from 'yup';

const planFormSchema = object().shape({
    name: string()
        .required(t('validation.required', { field: t('pages.name') })),
    description: string()
        .required(t('validation.required', { field: t('pages.description') })),
    price: string()
        .nullable(),
    price_per_unit: string()
        .nullable(),
    is_active: boolean(),
    is_private: boolean(),
    is_popular: boolean(),
    is_custom_price: boolean(),
    frequency: string(),
    monthly_credits: number()
        .typeError(t('validation.number', { field: t('pages.monthly_credits') }))
        .required(t('validation.required', { field: t('pages.monthly_credits') }))
        .min(0, t('validation.min', { field: t('pages.monthly_credits'), min: 0 })),
    features: array(),
    user_ids: array()
});

export default planFormSchema;
