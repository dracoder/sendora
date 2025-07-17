import { LabeledInput } from '@/Components/ui/input';
import { useTranslation } from 'react-i18next';

const defaultValues = {
    value: '',
}

function Form({ register, errors, watch, control }) {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col gap-4'>
            {watch('type') === 'text' ? (
                <LabeledInput label={t('pages.value')} id='value' type="text" errors={errors} {...register("value")} required />
            ) : (
                <></>
            )}
        </div>
    )
}

export { Form, defaultValues }
