import { t } from 'i18next';
import { string, object } from 'yup';

const apiKeyFormSchema = object().shape({
    value: string().required(t('validation.required', { field: t('pages.value') })),
});

export default apiKeyFormSchema;
