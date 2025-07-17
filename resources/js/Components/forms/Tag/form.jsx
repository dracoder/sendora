import { LabeledInput } from '@/Components/ui/input';
import { LabeledAsyncSelect } from '@/Components/ui/select';
import { useTranslation } from 'react-i18next';

const defaultValues = {
    name: '',
    organization_id: null,
}

function Form({ register, errors, watch, control }) {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col gap-4'>
            <LabeledInput label={t('pages.name')} id='name' type="text" errors={errors} {...register("name")} required />

            <LabeledAsyncSelect
                label={t('pages.organization')}
                name='organization_id'
                model='Organization'
                labelKey='name'
                orderBy='id'
                searchKeys={['name', 'email', 'owner_name']}
                placeholder={t('components.select_one')}
                preload
                errors={errors}
                control={control}
                helper={t('pages.leave_blank_tag_global')}
                className='!mb-0'
            />
        </div>
    )
}

export { Form, defaultValues }
