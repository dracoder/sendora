import { Button } from '@/Components/ui/button';
import { Input, LabeledInput } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { LabeledFormSwitch } from '@/Components/ui/switch';
import { LabeledTextarea } from '@/Components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import SelectOptionService from '@/Services/SelectOptionService';
import { CustomAsyncSelect } from '@/Components/ui/custom-select';

const defaultValues = {
    name: '',
    is_active: true,
    is_popular: false,
    frequency: 'monthly',
    price: '',
    description: '',
    is_custom_price: false,
    price_per_unit: '',
    monthly_credits: 0,
    features: [],
    is_private: false,
    user_ids: [],
}

function Form({ register, errors, watch, control, setValue, isEditing = false }) {
    const { t } = useTranslation();
    const isPrivate = watch('is_private');
    
    useEffect(() => {
        if (!Array.isArray(watch('features'))) {
            setValue('features', []);
        }
        if (!isPrivate) {
            setValue('user_ids', []);
        }
    }, [watch, setValue, isPrivate]);


    
    return (
        <div className='flex flex-col gap-4'>
            {isEditing && (
                <>
                    <input type="hidden" {...register("frequency")} />
                    <input type="hidden" {...register("is_custom_price")} />
                    <input type="hidden" {...register("price")} />
                    <input type="hidden" {...register("price_per_unit")} />
                </>
            )}
            
            <div className='flex gap-4'>
                <LabeledInput divClassName='w-full' label={t('pages.name')} id='name' type="text" errors={errors} {...register("name")} required
                    helper={t('pages.plan_name_helper')}
                />

                <div className='flex gap-4 items-start'>
                    <LabeledInput 
                        divClassName='w-full' 
                        label={t('pages.monthly_credits')} 
                        id='monthly_credits' 
                        type="number" 
                        errors={errors} 
                        {...register("monthly_credits")} 
                        required
                    />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-2 w-full'>
                    <LabeledFormSwitch className='w-full mb-0' label={t('pages.is_active') + '?'} id='is_active' control={control} errors={errors} {...register("is_active")} />
                    <LabeledFormSwitch className='w-full mb-0' label={'🔥 ' + t('pages.is_popular') + '?'} id='is_popular' control={control} errors={errors} {...register("is_popular")} />
                </div>
            </div>

            <div className='border-t pt-4 mt-2'>
                <h3 className="text-lg font-medium mb-2">{t('pages.plan_visibility')}</h3>
                <div className="flex items-center space-x-2 mb-4">
                    <LabeledFormSwitch 
                        className='w-full mb-0' 
                        label={t('pages.private_plan')} 
                        id='is_private' 
                        control={control} 
                        errors={errors} 
                        {...register("is_private")} 
                    />
                </div>
                
                {isPrivate && (
                    <div className="mb-4">
                        <CustomAsyncSelect
                            isMulti
                            label={t('pages.select_users')}
                            name="user_ids"
                            model="User"
                            control={control}
                            errors={errors}
                            searchKeys="first_name,last_name,email"
                            placeholder={t('components.select_users')}
                            divClassName="mt-1"
                            required
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('pages.private_plan_description')}
                        </p>
                    </div>
                )}
            </div>

            {!isEditing && (
                <>
                    {/* <div className='flex gap-4'>
                        <div className='flex flex-col gap-2 w-full'>
                            <div className='flex gap-4'>
                                <LabeledFormSwitch className='w-full mb-0' label={t('pages.is_custom_price')} id='is_custom_price' control={control} errors={errors} {...register("is_custom_price")} />
                            </div>
                        </div>
                    </div> */}

                    {!watch('is_custom_price') && <div className='flex gap-4'>
                        <div className='flex flex-col gap-2 w-full'>
                            <Label htmlFor='frequency'>{t('pages.frequency')}</Label>
                            <div className='flex gap-4'>
                                <Button type='button' variant={watch('frequency') === 'monthly' ? 'default' : 'outline'} onClick={() => setValue('frequency', 'monthly')}>{t('pages.monthly')}</Button>
                                <Button type='button' variant={watch('frequency') === 'yearly' ? 'default' : 'outline'} onClick={() => setValue('frequency', 'yearly')}>{t('pages.yearly')}</Button>
                            </div>
                        </div>
                    </div>}
                </>
            )}

            <div className='flex gap-4 items-start'>
                {!isEditing && !watch('is_custom_price') ?
                    <LabeledInput divClassName='w-full' label={t('pages.price')} id='price' type="text" errors={errors} {...register("price")} required />
                    : !isEditing && watch('is_custom_price') &&
                    <LabeledInput divClassName='w-full' label={t('pages.price_per_unit')} id='price_per_unit' type="text" errors={errors} {...register("price_per_unit")} required />
                }

                <LabeledInput divClassName='w-full' label={t('pages.description')} id='description' type="text" errors={errors} {...register("description")} />
            </div>

            <div className='flex gap-4'>
                <div className='w-full gap-4'>
                    <Label>
                        {t('components.features')}
                        <Button className='ml-4' type='button' variant='outline' onClick={() => {
                            const features = watch('features') || [];
                            features.push('');
                            setValue('features', features);
                        }}>
                            <Plus />
                        </Button>
                    </Label>
                    {Array.isArray(watch('features')) && watch('features').map((feature, index) => (
                        <div key={index} className='flex gap-2 my-2'>
                            <Input
                                className='w-full'
                                id={`features[${index}]`}
                                type="text"
                                errors={errors}
                                {...register(`features[${index}]`)}
                            />
                            <Button type='button' variant='outline' onClick={() => {
                                const features = watch('features');
                                features.splice(index, 1);
                                setValue('features', features);
                            }}>
                                <X />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export { Form, defaultValues }
