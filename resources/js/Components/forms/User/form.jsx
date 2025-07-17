import { LabeledInput } from '@/Components/ui/input';
import { LabeledFormSwitch } from '@/Components/ui/switch';
import { LabeledFormSelect } from "@/components/ui/select"
import { useTranslation } from 'react-i18next';

const defaultValues = {
    role: '',
    is_affiliate: false,
    first_name: '',
    last_name: '',
    email: '',
}

function Form({ register, errors, watch, control }) {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col gap-4'>
            <LabeledInput label={t('pages.first_name')} id="first_name" type="text" errors={errors} {...register("first_name")} required />
            <LabeledInput label={t('pages.last_name')} id="last_name" type="text" errors={errors} {...register("last_name")} />
            <LabeledInput label={t('pages.email')} id="email" type="email" errors={errors} {...register("email")} required />

            <div className='flex flex-row gap-4 items-center justify-center'>
                <LabeledFormSelect divClassName="w-1/2" label={t('pages.role')} id="role" watch={watch} errors={errors} {...register('role')} options={[
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: t('pages.user') },
                ]} required />

                <LabeledFormSwitch className="w-1/2" label={t('pages.is_affiliate') + '?'} id='is_affiliate' control={control} errors={errors} {...register("is_affiliate")} />
            </div>
        </div>
    )
}

export { Form, defaultValues }
