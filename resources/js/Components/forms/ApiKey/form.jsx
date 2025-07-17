import { LabeledInput } from '@/Components/ui/input';
import { useTranslation } from 'react-i18next';

const defaultValues = {
    name: '',
}

function Form({ register, errors, watch, control }) {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col gap-4'>
            <LabeledInput label={t('pages.name')} id='name' type="text" errors={errors} {...register("name")} required />
        </div>
    )
}

export { Form, defaultValues }
