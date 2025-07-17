import { Button } from '@/Components/ui/button';
import { LabeledInput } from '@/Components/ui/input';
import { useTranslation } from 'react-i18next';
import { LabeledFormSwitch } from '@/Components/ui/switch';
import { LabeledTextarea } from '@/Components/ui/textarea';
import { useState } from 'react';

const defaultValues = {
    name: '',
    description: '',
    credits: '',
    price: '',
    is_active: true,
    featured: false,
}

function Form({ register, errors, watch, handleSubmit, control }) {
    const { t } = useTranslation();

    return (
        <div className='flex flex-col gap-4'>
            <LabeledInput label={t('pages.name')} id="name" type="text" errors={errors} {...register("name")} required />
            
            <div className='flex gap-4'>
                <LabeledInput 
                    divClassName='w-1/2' 
                    label={t('pages.credits')} 
                    id="credits" 
                    type="number" 
                    errors={errors} 
                    {...register("credits")} 
                    required 
                />
                
                <LabeledInput 
                    divClassName='w-1/2' 
                    label={t('pages.price')} 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    errors={errors} 
                    {...register("price")} 
                    required 
                />
            </div>
            
            <LabeledTextarea 
                label={t('pages.description')} 
                id="description" 
                errors={errors} 
                {...register("description")} 
            />

            <hr className='my-2' />
            <h2 className='text-lg font-semibold -mt-4'>{t('menu.settings')}</h2>

            <div className='flex gap-4'>
                <div className='flex gap-2 w-full'>
                    <LabeledFormSwitch 
                        className='w-1/2 mb-0' 
                        label={t('pages.is_active')} 
                        id='is_active' 
                        control={control} 
                        errors={errors} 
                        {...register("is_active")} 
                    />
                    <LabeledFormSwitch 
                        className='w-1/2 mb-0' 
                        label={t('pages.featured')} 
                        id='featured' 
                        control={control} 
                        errors={errors} 
                        {...register("featured")} 
                    />
                </div>
            </div>
        </div>
    )
}

export { Form, defaultValues }