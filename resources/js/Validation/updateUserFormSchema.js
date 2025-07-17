import { t } from 'i18next';
import { string, object } from 'yup';

const updateUserFormSchema = object().shape({
    first_name: string().required(t('validation.required', { field: t('pages.first_name') })),
    last_name: string(),
    email: string().required(t('validation.required', { field: t('pages.email') })),
});

export default updateUserFormSchema;
