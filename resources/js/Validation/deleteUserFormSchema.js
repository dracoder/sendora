import { t } from 'i18next';
import { string, object } from 'yup';

const deleteUserFormSchema = object().shape({
    password: string().required(t('validation.required', { field: t('pages.password') })),
});

export default deleteUserFormSchema;
