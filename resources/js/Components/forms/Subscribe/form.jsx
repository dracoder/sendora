import { LabeledInput } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import RichEditor from '@/Components/ui/rich-editor';
import { LabeledAsyncSelect, LabeledFormSelect, SearchableSelect } from '@/Components/ui/select';
import DataService from '@/Services/DataService';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from "@/Components/ui/slider";

const defaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country_code: '',
    postal_code: '',
    tax_code: '',
    vat_number: '',
    pec: '',
    sdi: '',
    emails_amount: 100000
}

function Form({ register, errors, watch, control, setValue, plan }) {
    const { t } = useTranslation();

    const [countries, setCountries] = useState([]);

    useEffect(() => {
        DataService.countries(setCountries);
    }, []);

    function formatNumber(number) {
        return new Intl.NumberFormat('it-IT').format(number);
    }

    const min = plan.id == 'free' ? 1000 : 100000;
    const max = plan.id == 'free' ? 7500 : 750000;

    return (
        <div className="w-full space-y-6">
            {plan.is_custom_price && (
                <div className='w-full gap-y-2 flex flex-col items-start pb-4 border-b'>
                    <div className='flex gap-4 items-center'>
                        <span className='font-bold text-lg'>{t('pages.monthly_usage')}:</span>
                        <span className='text-sm font-semibold'>{formatNumber(watch('emails_amount'))} {t('pages.outbound_emails')}</span>
                    </div>

                    <div className="gap-2 flex items-center justify-evenly w-full">
                        <span className='text-sm font-semibold'>{formatNumber(min)}</span>
                        <Slider defaultValue={[min]} step={min} min={min} max={max} errors={errors} {...register("emails_amount")} />
                        <span className='text-sm font-semibold'>{formatNumber(max)}</span>
                    </div>
                    <div className='w-full flex justify-end'>
                        <span className='text-xs text-slate-400'>{t('pages.if_you_need_more')} <a href='#' className='text-slate-300 hover:text-slate-500 underline font-semibold'>{t('pages.contact_us')}</a></span>
                    </div>
                    <div className='w-full flex justify-start items-center gap-4'>
                        <span className='font-bold text-lg'>{t('pages.current_price')}:</span>
                        <span className='text-lg text-yellow-400 font-semibold'>{formatNumber(watch('emails_amount') * (plan.price_per_unit ?? 0))} €</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LabeledInput label={t('pages.first_name')} id='first_name' type="text" errors={errors} {...register("first_name")} required />
                <LabeledInput label={t('pages.last_name')} id='last_name' type="text" errors={errors} {...register("last_name")} required />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LabeledInput label={t('pages.email')} id='email' type="email" errors={errors} {...register("email")} required />
                <LabeledInput label={t('pages.phone')} id='phone' type="text" errors={errors} {...register("phone")} required />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <LabeledInput label={t('pages.address')} id='address' type="text" errors={errors} {...register("address")} required divClassName="col-span-1 lg:col-span-2" />
                <LabeledInput divClassName='col-span-1' label={t('pages.postal_code')} id='postal_code' type="text" errors={errors} {...register("postal_code")} required />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <LabeledInput label={t('pages.city')} id='city' type="text" errors={errors} {...register("city")} required />
                <LabeledInput label={t('pages.state')} id='state' type="text" errors={errors} {...register("state")} required />
                <SearchableSelect label={t('pages.country')} id='country' errors={errors} {...register("country")} required watch={watch} placeholder={t('components.select_placeholder')}
                    options={countries} control={control} isSearchable onChange={(value) => { setValue('country', value) }}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <LabeledInput label={t('pages.tax_code')} id='tax_code' type="text" errors={errors} {...register("tax_code")} />
                <LabeledInput label={t('pages.vat_number')} id='vat_number' type="text" errors={errors} {...register("vat_number")} />
                <LabeledInput label={t('pages.pec')} id='pec' type="text" errors={errors} {...register("pec")} />
                <LabeledInput label={t('pages.sdi')} id='sdi' type="text" errors={errors} {...register("sdi")} />
            </div>
        </div>
    );
}

export { Form, defaultValues }
