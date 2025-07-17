import { useEffect, useRef, useState } from 'react';
import { router, usePage, Link } from '@inertiajs/react';

import { Button } from "@/Components/ui/button"
import { useTranslation } from 'react-i18next';

import { ChevronDown, CircleX, CircleCheck } from 'lucide-react';
import { cn, formatFriendlyDate, timestampToDate } from '@/lib/utils';
import StripeService from '@/Services/StripeService';
import { Skeleton } from '@/Components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import AlertDanger from '@/Components/AlertDanger';
import { Badge } from '@/Components/ui/badge';
import LoadingButton from '@/Components/LoadingButton';

export default function ActiveSubscriptionForm({
    className,
    ...props
}) {
    const alertRef = useRef();
    const { t } = useTranslation();
    const { user, current_subscription } = usePage().props;

    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [payments, setPayments] = useState([]);

    const [cancelLoading, setCancelLoading] = useState(false);

    const getNextRenewal = (created_at) => {
        const date = new Date(created_at);
        const nextRenewal = new Date(date.setMonth(date.getMonth() + 1));
        return formatFriendlyDate(nextRenewal);
    }

    useEffect(() => {
        if (user.stripe_id) {
            StripeService.fetchPaymentHistory((data) => { setPayments(data) });
        }
    }, []);

    const cancelSubscription = () => {
        setCancelLoading(true);
        StripeService.cancelSubscription((data) => {
            toast({
                title: t('pages.item_cancelled', { item: t('pages.subscription') }),
                duration: 3000,
            });
            setCancelLoading(false);
            window.location.reload();
        });
    }

    const updatePaymentMethod = () => {
        StripeService.updatePaymentMethod((data) => {
            console.log(data)
        });
    }

    return (
        <div className="mt-6 space-y-10">
            <div className="mt-6 flex gap-x-2">
                <ul className='space-y-5 w-full'>
                    <li className='flex'>
                        <span className='font-semibold mr-2'>{t('pages.name')}:</span>
                        <span className='flex flex-row gap-x-2'>{current_subscription ? current_subscription.subscription_plan.name : 'Free'}{current_subscription && (
                            <Badge variant={current_subscription.stripe_status == 'active' ? 'success' : current_subscription.stripe_status == 'pastDue' ? 'warning' : 'destructive'} className='capitalize'>
                                {current_subscription.stripe_status == 'pastDue' ? t('pages.past_due') : t('pages.' + current_subscription.stripe_status) ?? ''}
                            </Badge>
                        )}
                            {current_subscription && current_subscription.subscription_plan.is_custom_price && (
                                <Badge variant={'secondary'} className='lowercase'>
                                    {new Intl.NumberFormat('it-IT').format(current_subscription.quantity)} {t('pages.emails')}
                                </Badge>
                            )}
                        </span>
                    </li>
                    <li>
                        <span className='font-semibold mr-2'>{t('pages.price')}:</span>
                        {current_subscription ? (
                            <span className='lowercase'>
                                {current_subscription.subscription_plan.is_custom_price ? (
                                    <><span>{current_subscription.subscription_plan.price_per_unit}€</span> <span>{t('pages.per_email')}</span></>
                                ) : (
                                    <span>{current_subscription.subscription_plan.price}€</span>
                                )}
                                &nbsp;/&nbsp;
                                <span>{t('pages.' + current_subscription.subscription_plan.frequency)}</span>
                            </span>
                        ) : (
                            <span>00.00€</span>
                        )}
                    </li>
                    {current_subscription && current_subscription.stripe_status !== 'cancelled' ? (
                        <li>
                            <span className='font-semibold mr-2'>{t('pages.next_renewal')}:</span>
                            <span>{getNextRenewal(current_subscription.created_at)}</span>
                        </li>
                    ) : current_subscription && current_subscription.stripe_status == 'cancelled' && current_subscription.ends_at && (
                        <li>
                            <span className='font-semibold mr-2'>{t('pages.valid_until')}:</span>
                            <span>{getNextRenewal(current_subscription.ends_at)}</span>
                        </li>
                    )}
                </ul>
                <div className='space-y-2 w-3/5 flex flex-col items-end'>
                    {current_subscription && current_subscription.subscription_plan.is_upgradable && (
                        <Link href={route('subscribe')}><Button className='w-32' variant="yellow" size='sm'>{t('menu.upgrade')}</Button></Link>
                    )}
                    {current_subscription && current_subscription.stripe_status !== 'cancelled' ? (
                        <>
                            {/* <Button className='min-w-32' variant='secondary' size='sm' onClick={updatePaymentMethod}>{t('pages.update_billing_data')}</Button> */}
                            <LoadingButton loading={cancelLoading} t={t} className='w-32' variant='destructive' size='sm' onClick={() => alertRef && alertRef.current.open()}>{t('components.cancel')}</LoadingButton>

                            <AlertDanger ref={alertRef} onConfirm={cancelSubscription} />
                        </>
                    ) : (
                        <Link href={route('subscribe')}><Button className='w-32' variant="yellow" size='sm'>{t('menu.subscribe')}</Button></Link>
                    )}
                </div>
            </div>

            {payments.length > 0 ? (
                <div className="flex flex-col w-full">
                    <div
                        className={cn('p-2 rounded-lg bg-slate-100 text-black flex justify-between cursor-pointer select-none', showPaymentHistory && 'sm:rounded-b-none')}
                        onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                    >
                        <strong>{t('pages.payment_history')}</strong>
                        {showPaymentHistory ? <ChevronDown className='w-6 h-6' /> : <ChevronDown className='w-6 h-6 transform rotate-180' />}
                    </div>
                    {showPaymentHistory && <PaymentHistory t={t} payments={payments} />}
                </div>
            ) : (
                <Skeleton className='h-8 w-full' />
            )}
        </div>
    )
}

function PaymentHistory({ t, payments }) {
    return (
        <div className='dark:border dark:border-t-0 p-1 shadow sm:rounded-lg sm:rounded-t-none h-48 overflow-auto'>
            <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
                <thead className='text-xs'>
                    <tr>
                        <th scope='col' className='text-center py-2'>{t('pages.date')}</th>
                        <th scope='col' className='text-center py-2'>{t('pages.amount')}</th>
                        <th scope='col' className='text-center py-2'>{t('pages.plan')}</th>
                        <th scope='col' className='text-center py-2'>{t('pages.status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment, index) => (
                        <tr key={index} className="border-b">
                            <td className='text-center'>{formatFriendlyDate(timestampToDate(payment.created))}</td>
                            <td className='text-center'>{(payment.amount / 100).toFixed(2)}€</td>
                            <td className='text-center'>{payment.subscription ? payment.subscription.name : 'Credits'}</td>
                            <td className='text-center flex justify-center'>{payment.status == 'succeeded' ? <CircleCheck className='text-green-500' /> : <CircleX className='text-red-500' />}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
