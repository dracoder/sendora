import { LabeledInput } from '@/Components/ui/input';
import { LabeledAsyncSelect } from '@/Components/ui/select';
import { LabeledFormSwitch } from '@/Components/ui/switch';
import { LabeledTextarea } from '@/Components/ui/textarea';
import React from 'react';
import { useTranslation } from 'react-i18next';

const defaultValues = {
    title: '',
    is_subscribed: true,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization_id: '',
    email_status: '',
    company: '',
    industry: '',
    location: '',
   // profile_picture: '',
    linkedin_url: '',
    note: '',
}

function Form({ register, errors, watch, control }) {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col gap-4'>
            <div className='flex gap-4'>
                <LabeledInput label={t('pages.title')} id='title' type="text" errors={errors} {...register("title")} />
                <LabeledFormSwitch label={t('pages.is_subscribed') + '?'} id='is_subscribed' control={control} errors={errors} {...register("is_subscribed")} />
            </div>

            <div className='flex gap-4'>
                <LabeledInput divClassName='w-1/2' label={t('pages.first_name')} id='first_name' type="text" errors={errors} {...register("first_name")} />
                <LabeledInput divClassName='w-1/2' label={t('pages.last_name')} id='last_name' type="text" errors={errors} {...register("last_name")} />
            </div>

            <div className='flex gap-4'>
                <LabeledInput divClassName='w-1/2' label={t('pages.email')} id='email' type="email" errors={errors} {...register("email")} required />
                <LabeledInput divClassName='w-1/2' label={t('pages.phone')} id='phone' type="text" errors={errors} {...register("phone")} />
            </div>

            <div className='flex gap-4'>
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
                    required
                    className='mb-0 w-1/2'
                />

                {watch('organization_id') > 0 && (
                    <LabeledAsyncSelect
                        label={t('menu.tags')}
                        name='tag_ids'
                        model='Tag'
                        labelKey='name'
                        orderBy='id'
                        searchKeys={['name']}
                        placeholder='...'
                        preload
                        errors={errors}
                        control={control}
                        scoped={{ 'organization_id': watch('organization_id') }}
                        isMulti
                        required
                        className='mb-0 w-1/2'
                    />
                )}
            </div>

            <div className='flex gap-4'>
                <LabeledInput divClassName='w-1/2' label={t('pages.email_status')} id='email_status' type="text" errors={errors} {...register("email_status")} />
                <LabeledInput divClassName='w-1/2' label={t('pages.company')} id='company' type="text" errors={errors} {...register("company")} />
            </div>

            <div className='flex gap-4'>
                <LabeledInput divClassName='w-1/2' label={t('pages.industry')} id='industry' type="text" errors={errors} {...register("industry")} />
                <LabeledInput divClassName='w-1/2' label={t('pages.location')} id='location' type="text" errors={errors} {...register("location")} />
            </div>

            <div className='flex gap-4'>
                {/* <LabeledInput divClassName='w-1/2' label={t('pages.profile_picture')} id='profile_picture' type="text" errors={errors} {...register("profile_picture")} /> */}
                <LabeledInput divClassName='w-1/2' label={t('pages.linkedin_url')} id='linkedin_url' type="text" errors={errors} {...register("linkedin_url")} />
            </div>

            <LabeledTextarea label={t('pages.notes')} id='note' errors={errors} {...register("note")} rows={5} />
        </div>
    )
}

export { Form, defaultValues }
