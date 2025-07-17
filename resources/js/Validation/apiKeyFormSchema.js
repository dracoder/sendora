import { t } from 'i18next';
import { string, object } from 'yup';

const apiKeyFormSchema = object().shape({
    name: string().required(t('validation.required', { field: t('pages.name') })),
});

export default apiKeyFormSchema;
