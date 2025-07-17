import { Button } from '@/Components/ui/button';
import { LabeledInput } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RichEditor from '@/Components/ui/rich-editor';
import { LabeledAsyncSelect, LabeledFormSelect } from '@/Components/ui/select';
import { LabeledFormSwitch } from '@/Components/ui/switch';
import { ChevronDownSquare, ChevronRightSquare, Eye, EyeClosed, MailPlus, Send, Trash, CalendarPlus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VariablesAndConditions from '@/Components/VariablesAndConditions';
import EmailPreview from './email-preview';
import EmailSend from './email-send';
import { DatePicker } from '@/Components/ui/date-picker';
import { DateTimePicker } from '@/Components/ui/datetime-picker';
import { DateRangePicker } from '@/Components/ui/daterange-picker';

const defaultSkipDate = {
    from: '',
    to: ''
}

const defaultEmail = {
    title: '',
    delay_value: 0,
    delay_unit: null,
    is_active: true,
    subject: '',
    content: ''
}

const defaultValues = {
    name: '',
    organization_id: null,
    template_id: null,
    start_at: '',
    tag_ids: null,
    is_active: true,
    emails: [
        { ...defaultEmail }
    ],
    skip_dates: []
}

function Form({ register, errors, watch, control, setValue }) {
    const { t } = useTranslation();

    const addSkipDate = () => {
        setValue('skip_dates', [...watch('skip_dates'), { ...defaultSkipDate }])
    }

    const addEmail = () => {
        setValue('emails', [...watch('emails'), { ...defaultEmail }])
    }

    useEffect(() => {
        if (watch('skip_dates').length > 0) {
            setSkipDatesCollapsed(true);
        }
    }, []);

    const dragEmailIndex = useRef(null);
    const draggedOverEmailIndex = useRef(null);

    function handleSort() {
        const emailsClone = [...watch('emails')];
        const temp = emailsClone[dragEmailIndex.current];
        emailsClone[dragEmailIndex.current] = emailsClone[draggedOverEmailIndex.current];
        emailsClone[draggedOverEmailIndex.current] = temp;
        setValue('emails', emailsClone);
    }

    const [skipDatesCollapsed, setSkipDatesCollapsed] = useState(false);

    const [showEmailPreview, setShowEmailPreview] = useState(false);
    const [showEmailSend, setShowEmailSend] = useState(false);
    const [emailId, setEmailId] = useState(null);

    const handlePreviewEmailAction = (emailId) => {
        setEmailId(emailId);
        setShowEmailPreview(true);
    }

    const handleSendEmailAction = (emailId) => {
        setEmailId(emailId);
        setShowEmailSend(true);
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex gap-4 w-full">
                <LabeledInput label={t('pages.name')} id='name' type="text" errors={errors} {...register("name")} required divClassName='w-1/3' />

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
                    className='!mb-0 w-1/3'
                    required
                />

                {watch('organization_id') && <LabeledAsyncSelect
                    label={t('pages.template')}
                    name='template_id'
                    model='Template'
                    labelKey='name'
                    orderBy='id'
                    searchKeys={['name']}
                    placeholder={t('components.select_one')}
                    preload
                    errors={errors}
                    control={control}
                    scoped={{ 'organization_id': watch('organization_id') }}
                    className='!mb-0 w-1/3'
                    required
                />}
            </div>
            <div className="flex gap-4 w-full">
                <DateTimePicker watch={watch} label={t('pages.start_at')} id='start_at' name='start_at' errors={errors} {...register("start_at")} divClassName='w-1/3' onChange={(res) => setValue('start_at', res)} />

                {watch('organization_id') && <LabeledAsyncSelect
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
                    className='mb-0 w-1/3'
                />}


                <LabeledFormSwitch label={t('pages.is_active') + '?'} id='is_active' control={control} errors={errors} {...register("is_active")} className='w-1/3' />
            </div>

            <hr />

            <div className="flex flex-col gap-4 w-full p-4 items-start card dark:border">
                <div className="flex gap-4 w-full">
                    <Label className='text-xl font-semibold'>{t('pages.pause_campaign')} {watch('skip_dates').length > 0 && skipDatesCollapsed ? ('(' + watch('skip_dates').length + ')') : ''}</Label>
                    {skipDatesCollapsed ? (
                        <Eye className='p-1 bg-border rounded-full cursor-pointer' onClick={() => setSkipDatesCollapsed(!skipDatesCollapsed)} />
                    ) : (
                        <EyeClosed className='p-1 bg-border rounded-full cursor-pointer' onClick={() => setSkipDatesCollapsed(!skipDatesCollapsed)} />
                    )}
                </div>

                {!skipDatesCollapsed && (
                    <>
                        {watch('skip_dates') && watch('skip_dates').map((skip_date, index) => (
                            <SkipDateForm
                                key={index} index={index} register={register} errors={errors} watch={watch} control={control} setValue={setValue}
                            />
                        ))}
                        <Button variant='secondary' size='sm' type="button" onClick={() => addSkipDate()}><CalendarPlus /> {t('components.add')}</Button>
                    </>
                )}
            </div>

            <hr />

            <div className="flex flex-col gap-4 w-full items-start">
                <Label className='text-xl font-semibold'>{t('pages.emails')}</Label>

                {watch('emails') && watch('emails').map((email, index) => (
                    <EmailForm
                        key={index} index={index} register={register} errors={errors} watch={watch} control={control} setValue={setValue}
                        previewEmailAction={handlePreviewEmailAction}
                        sendEmailAction={handleSendEmailAction}
                        draggable
                        onDragStart={() => dragEmailIndex.current = index}
                        onDragEnter={() => draggedOverEmailIndex.current = index}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                    />
                ))}
                <Button variant='secondary' size='sm' type="button" onClick={() => addEmail()}><MailPlus /> {t('components.add')}</Button>

                <EmailPreview open={showEmailPreview} onOpenChange={setShowEmailPreview} emailId={emailId} />
                <EmailSend open={showEmailSend} onOpenChange={setShowEmailSend} emailId={emailId} />
            </div>
        </div>
    )
}

function SkipDateForm({ index, register, errors, watch, control, setValue, ...props }) {
    const { t } = useTranslation();

    const removeSkipDate = (index) => {
        setValue('skip_dates', watch('skip_dates').filter((skip_date, i) => i !== index))
    }

    const formatDatesFromDateRage = (dateStr) => {
        const dateObj = new Date(dateStr);

        // Get the components of the date
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(dateObj.getDate()).padStart(2, '0');

        // Format the date to "YYYY-MM-DD"
        return `${year}-${month}-${day}`;
    }

    const handleDateRangeChange = (value, field) => {
        if (value.from && value.to) {
            setValue(`skip_dates.[${index}].from`, formatDatesFromDateRage(value.from));
            setValue(`skip_dates.[${index}].to`, formatDatesFromDateRage(value.to));
        }
    }

    useEffect(() => {
        if (!watch(`skip_dates.[${index}].from`) || !watch(`skip_dates.[${index}].to`)) return;

        const from = new Date(watch(`skip_dates.[${index}].from`) + 'T00:00:00.000');
        const to = new Date(watch(`skip_dates.[${index}].to`) + 'T00:00:00.000');
        setValue(`skip_dates.[${index}].dates`, {
            from: from,
            to: to
        });
    }, [watch(`skip_dates.[${index}].from`), watch(`skip_dates.[${index}].to`)]);

    return (
        <div className='relative w-full' {...props}>
            <div className={`card flex flex-col gap-4 w-full dark:border px-4 py-2 shadow sm:rounded-lg min-h-10 select-none cursor-pointer`}>
                <div className="flex gap-4 w-full items-center">
                    <DateRangePicker key={`skip_dates.[${index}].dates`} errors={errors} control={control} name={`skip_dates.[${index}].dates`} onChange={handleDateRangeChange} watch={watch} />
                    <Button variant='destructive' size='sm' type="button" onClick={() => removeSkipDate(index)}><Trash /> {t('components.delete')}</Button>
                </div>
            </div>
        </div>
    )
}

function EmailForm({ index, register, errors, watch, control, setValue, previewEmailAction, sendEmailAction, ...props }) {
    const { t } = useTranslation();

    const contentInput = useRef(null);

    const [collapsed, setCollapsed] = useState(true);
    const [variablesCollapsed, setVariablesCollapsed] = useState(true);

    return (
        <div className='relative w-full' {...props}>
            <div className={`card flex flex-col gap-4 w-full dark:border ${collapsed === true ? 'pb-1 sm:pb-2' : 'pb-4 sm:pb-8'} px-4 sm:px-8 pt-1 sm:pt-2 shadow sm:rounded-lg min-h-10 select-none cursor-pointer`}>
                {collapsed ? (
                    <React.Fragment>
                        <ChevronRightSquare className='absolute top-0 left-0 -mt-2 p-1 bg-border rounded-full cursor-pointer' onClick={() => setCollapsed(false)} />
                        <div className="flex w-full justify-between items-center">
                            <div className='flex flex-row gap-4'>
                                <span className='font-semibold'>{watch(`emails[${index}].title`) || 'n/a'}</span>
                                |
                                <div className='text-sm flex gap-1 min-w-10'>
                                    {watch(`emails[${index}].delay_value`) && watch(`emails[${index}].delay_unit`) ? (
                                        <>
                                            <span>{watch(`emails[${index}].delay_value`)}</span>
                                            <span>{watch(`emails[${index}].delay_unit`)}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sent</span>
                                            <span>immediately</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <EmailButtons index={index} control={control} errors={errors} register={register} watch={watch} setValue={setValue} previewEmailAction={previewEmailAction} sendEmailAction={sendEmailAction} />
                        </div>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <ChevronDownSquare className='absolute top-0 left-0 -mt-2 p-1 bg-border rounded-full cursor-pointer' onClick={() => setCollapsed(true)} />
                        <EmailButtons index={index} control={control} errors={errors} register={register} watch={watch} setValue={setValue} previewEmailAction={previewEmailAction} sendEmailAction={sendEmailAction} />

                        <div className="flex gap-4 w-full">
                            <LabeledInput label={t('pages.title')} id={'title'} type="text" errors={errors} {...register(`emails[${index}].title`)} required divClassName='w-1/4' />
                            <LabeledInput label={t('pages.subject')} id={`emails[${index}].subject`} type="text" errors={errors} {...register(`emails[${index}].subject`)} required divClassName='w-3/6' />

                            <LabeledInput label={t('pages.delay')} id={`emails[${index}].delay_value`} type="number" errors={errors} {...register(`emails[${index}].delay_value`)} divClassName='w-1/6' />
                            <LabeledFormSelect label={t('pages.delay_unit')} id={`emails[${index}].delay_unit`} control={control} errors={errors} {...register(`emails[${index}].delay_unit`)} divClassName='w-1/6' watch={watch}
                                options={[
                                    { label: t('components.minutes'), value: 'minutes' },
                                    { label: t('components.hours'), value: 'hours' },
                                    { label: t('components.days'), value: 'days' },
                                    { label: t('components.weeks'), value: 'weeks' },
                                    { label: t('components.months'), value: 'months' },
                                    { label: t('components.years'), value: 'years' },
                                ]}
                            />
                        </div>

                        <Label className='mt-4'>{t('pages.content')}<span className="text-red-500"> *</span></Label>

                        <RichEditor
                            ref={contentInput}
                            name='content'
                            control={control}
                            errors={errors}
                            value={watch(`emails[${index}].content`)}
                            setValue={setValue}
                            {...register(`emails[${index}].content`)}
                            className='h-40'
                            required
                        />

                        <div className="flex gap-4 w-full">
                            <Label className='text-xl font-semibold'>{t('variables_conditions.title')}</Label>
                            {variablesCollapsed ? (
                                <Eye className='p-1 bg-border rounded-full cursor-pointer' onClick={() => setVariablesCollapsed(!variablesCollapsed)} />
                            ) : (
                                <EyeClosed className='p-1 bg-border rounded-full cursor-pointer' onClick={() => setVariablesCollapsed(!variablesCollapsed)} />
                            )}

                        </div>
                        {!variablesCollapsed && (
                            <VariablesAndConditions />
                        )}
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}

const EmailButtons = ({ index, control, errors, register, watch, setValue, previewEmailAction, sendEmailAction }) => {
    const { t } = useTranslation();

    const removeEmail = (index) => {
        setValue('emails', watch('emails').filter((email, i) => i !== index))
    }

    return (
        <div className="flex gap-4 w-full justify-end items-center">
            <LabeledFormSwitch inline reversed label={t('pages.is_active') + '?'} id={`emails[${index}].is_active`} control={control} errors={errors} {...register(`emails[${index}].is_active`)} />
            <Button variant='secondary' size='sm' type="button" onClick={() => previewEmailAction(watch(`emails[${index}].id`))}><Eye /> {t('pages.preview')}</Button>
            {watch(`emails[${index}].id`) && <Button variant='secondary' size='sm' type="button" onClick={() => sendEmailAction(watch(`emails[${index}].id`))}><Send /> {t('pages.test')}</Button>}
            <Button variant='destructive' size='sm' type="button" onClick={() => removeEmail(index)}><Trash /> {t('components.delete')}</Button>
        </div>
    )
}

export { Form, defaultValues }
