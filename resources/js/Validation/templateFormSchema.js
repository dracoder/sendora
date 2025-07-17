import { t } from 'i18next';
import { string, object, number } from 'yup';

const templateFormSchema = object().shape({
    name: string().required(t('validation.required', { field: t('pages.name') })),
    organization_id: number().required(t('validation.required', { field: t('pages.organization') })),
    content: string().required(t('validation.required', { field: t('pages.content') })),
});

export default templateFormSchema;
