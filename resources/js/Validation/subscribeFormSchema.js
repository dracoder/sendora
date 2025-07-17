import { t } from 'i18next';
import { string, object } from 'yup';

const subscribeFormSchema = object().shape({
    first_name: string().required(t('validation.required', { field: t('pages.first_name') })),
    last_name: string().required(t('validation.required', { field: t('pages.last_name') })),
    email: string().required(t('validation.required', { field: t('pages.email') })).email(t('validation.email', { field: t('pages.email') })),
    phone: string().required(t('validation.required', { field: t('pages.phone') })),
    address: string().required(t('validation.required', { field: t('pages.address') })),
    city: string().required(t('validation.required', { field: t('pages.city') })),
    state: string().required(t('validation.required', { field: t('pages.state') })),
    // country_code is replaced by 'country' in the form and then gets the country.value as its value
    country: object().required(t('validation.required', { field: t('pages.country') })),
    postal_code: string().required(t('validation.required', { field: t('pages.postal_code') })),
    tax_code: string().nullable().optional(),
    vat_number: string().nullable().optional(),
    pec: string().nullable().optional(),
    sdi: string().nullable().optional(),
});

export default subscribeFormSchema;
