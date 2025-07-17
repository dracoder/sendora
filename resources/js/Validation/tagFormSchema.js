import { t } from 'i18next';
import { string, object, number } from 'yup';

const tagFormSchema = object().shape({
    name: string().required(t('validation.required', { field: t('pages.name') })),
    organization_id: number().nullable().optional(),
});

export default tagFormSchema;
