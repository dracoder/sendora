import { LabeledInput } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RichEditor from '@/Components/ui/rich-editor';
import { LabeledAsyncSelect } from '@/Components/ui/select';
import { useTranslation } from 'react-i18next';

const defaultValues = {
    name: '',
    organization_id: null,
    content: '',
}

function Form({ register, errors, watch, control, setValue }) {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col gap-4'>
            <div className="flex gap-4 w-full">
                <LabeledInput label={t('pages.name')} id='name' type="text" errors={errors} {...register("name")} required divClassName='w-1/2' />

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
                    className='!mb-0 w-1/2'
                    required
                />
            </div>

            <Label>{t('pages.content')}<span className="text-red-500"> *</span></Label>

            <RichEditor
                name='content'
                control={control}
                errors={errors}
                value={watch('content')}
                setValue={setValue}
                {...register('content')}
                className='h-40'
                required
            />
        </div>
    )
}

export { Form, defaultValues }
