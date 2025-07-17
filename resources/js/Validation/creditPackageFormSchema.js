import * as yup from 'yup';
import i18n from '@/i18n';

const creditPackageFormSchema = yup.object().shape({
    name: yup.string().required(i18n.t('validation.required', { field: i18n.t('pages.name') })),
    description: yup.string().nullable().optional(),
    credits: yup.number()
        .typeError(i18n.t('validation.required', { field: i18n.t('pages.credits') }))
        .required(i18n.t('validation.required', { field: i18n.t('pages.credits') }))
        .positive('Credits must be a positive number'),
    price: yup.number()
        .typeError(i18n.t('validation.required', { field: i18n.t('pages.price') }))
        .required(i18n.t('validation.required', { field: i18n.t('pages.price') }))
        .min(0, 'Price cannot be negative'),
    is_active: yup.boolean(),
    featured: yup.boolean(),
});

export default creditPackageFormSchema;