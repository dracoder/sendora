import { Button } from '@/Components/ui/button';
import { LabeledInput } from '@/Components/ui/input';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import LoadingButton from '@/Components/LoadingButton';
import EmailService from '@/Services/EmailService';
import { toast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useState } from 'react';

const defaultValues = {
    receiver: '',
    name: '',
    email: '',
    owner_name: '',
    phone: '',
    settings: {
        daily_limit: null,
        smtp: {
            host: '',
            port: '',
            encryption: '',
            username: '',
            password: '',
            from_email: '',
            from_name: '',
        }
    }
}

function Form({ register, errors, watch, handleSubmit, control }) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [showSmtpAction, setShowSmtpAction] = useState(false);

    const canTestSmtp = () => {
        return watch('name') && watch('settings.smtp.host') && watch('settings.smtp.port') && watch('settings.smtp.encryption');
    }

    const handleSmtpAction = async () => {
        setLoading(true);
        EmailService.testSmtp({
            organization_name: watch('name'),
            receiver: watch('receiver'),
            data: watch('settings.smtp'),
            onSuccess: (response) => {
                toast({
                    title: t('pages.email') + ' ' + t('pages.sent'),
                    duration: 3000
                });
                setLoading(false);
                setShowSmtpAction(false);
            },
            onError: (error) => {
                let error_message = t('pages.something_went_wrong');
                if(error.message) {
                    error_message = error.message;
                }
                toast({
                    title: error_message,
                    variant: 'destructive',
                    duration: 3000
                });
                setLoading(false);
            }
        });
    }

    return (
        <div className='flex flex-col gap-4'>
            <LabeledInput label={t('pages.name')} id="name" type="text" errors={errors} {...register("name")} required />
            <LabeledInput label={t('pages.email')} id="email" type="email" errors={errors} {...register("email")} />
            <LabeledInput label={t('pages.owner_name')} id="owner_name" type="text" errors={errors} {...register("owner_name")} />
            <LabeledInput label={t('pages.phone')} id="phone" type="text" errors={errors} {...register("phone")} />

            <hr className='my-2' />
            <h2 className='text-lg font-semibold -mt-4'>{t('menu.settings')}</h2>


            <div className='flex w-full'>
                <LabeledInput divClassName='w-1/2' label={t('pages.daily_limit')} id="settings.daily_limit" type="number" errors={errors} {...register("settings.daily_limit")} />
            </div>

            <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold'>{t('pages.your_smtp')}</h2>
                <Button size='sm' type='button' variant='secondary' disabled={!canTestSmtp()} onClick={() => setShowSmtpAction(true)}><Mail /> {t('pages.test')} {t('pages.smtp')}</Button>
            </div>
            <div className='flex gap-4 -mt-2'>
                <LabeledInput divClassName='w-1/2' label={t('pages.host')} id='host' type="text" errors={errors} {...register("settings.smtp.host")} />

                <div className='flex gap-4 w-1/2'>
                    <LabeledInput divClassName='w-1/2' label={t('pages.port')} id='port' type="text" errors={errors} {...register("settings.smtp.port")} />
                    <LabeledInput divClassName='w-1/2' label={t('pages.encryption')} id='encryption' type="text" errors={errors} {...register("settings.smtp.encryption")} />
                </div>
            </div>

            <div className='flex gap-4'>
                <LabeledInput divClassName='w-1/2' label={t('pages.username')} id='username' type="text" errors={errors} {...register("settings.smtp.username")} />
                <LabeledInput divClassName='w-1/2' label={t('pages.password')} id='password' type="text" errors={errors} {...register("settings.smtp.password")} />
            </div>

            <div className='flex gap-4'>
                <LabeledInput divClassName='w-1/2' label={t('pages.from_email')} id='from_email' type="email" errors={errors} {...register("settings.smtp.from_email")} />
                <LabeledInput divClassName='w-1/2' label={t('pages.from_name')} id='from_name' type="text" errors={errors} {...register("settings.smtp.from_name")} />
            </div>

            <Dialog open={showSmtpAction} onOpenChange={setShowSmtpAction}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('pages.test') + ' ' + t('pages.email')}</DialogTitle>
                    </DialogHeader>
                    <LabeledInput
                        label={t('pages.email')}
                        name="receiver"
                        id="receiver"
                        type="email"
                        {...register('receiver')}
                        errors={errors}
                        required
                    />
                    <div className="mt-6 flex justify-end">
                        <LoadingButton loading={loading} t={t} onClick={handleSubmit(handleSmtpAction)}>{t('pages.send')}</LoadingButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export { Form, defaultValues }
