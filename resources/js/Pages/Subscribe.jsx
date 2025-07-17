"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tab } from "@/components/ui/tab";
import NumberFlow from "@number-flow/react";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTranslation } from "react-i18next";
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import subscribeFormSchema from '@/Validation/subscribeFormSchema';
import { Form, defaultValues } from '@/Components/forms/Subscribe/form';
import { router, usePage } from '@inertiajs/react';

const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import StripeService from "@/Services/StripeService";
import LoadingButton from "@/Components/LoadingButton";
const emails_amount_default_plan = 100000;
const emails_amount_default_free = 1000;

export default function Subscribe({ plans, billing_data }) {
    const { t, i18n } = useTranslation();
    const { user, activeSubscription } = usePage().props;

    const [selectedFrequency, setSelectedFrequency] = useState(PAYMENT_FREQUENCIES[0]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState({});
    const [submitData, setSubmitData] = useState(null);

    const initStripe = async () => {
        await StripeService.createSetupIntent((response) => {
            setOptions({
                locale: i18n.language || 'en',
                clientSecret: response.client_secret,
                currency: 'eur'
            });
            setTimeout(() => {
                setLoading(false);
            }, 500);
        });
    }

    const { register, formState: { errors }, handleSubmit, watch, reset, control, setValue } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(subscribeFormSchema)
    });

    useEffect(() => {
        initStripe();
    }, []);

    const handlePlanSelection = (plan) => {
        if (Object.keys(options).length === 0) return;

        if (billing_data && billing_data.data) {
            billing_data.data.country = { value: billing_data.data.country_code, label: billing_data.data.country_name };
            reset({ ...billing_data.data, emails_amount: plan.id == 'free' ? emails_amount_default_free : emails_amount_default_plan });
        } else {
            reset({ ...user, emails_amount: plan.id == 'free' ? emails_amount_default_free : emails_amount_default_plan });
        }

        setSelectedPlan(plan);
    }
    const handleSubmitAction = (data) => {
        if (data.country) {
            data.country_code = data.country.value;
        }

        setSubmitData(data);
    }

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.subscribe'), href: route('subscribe'), current: true },
            ]}>
            <section className="flex flex-col items-center gap-10 py-10">
                <div className="space-y-7 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-medium md:text-5xl">{t('pages.subscribe_title')}</h1>
                        <p>{t('pages.subscribe_description')}</p>
                    </div>

                    {!selectedPlan && (
                        <div className="mx-auto flex w-fit rounded-full bg-[#F3F4F6] p-1 dark:bg-[#222]">
                            {PAYMENT_FREQUENCIES.filter(freq => {
                                if (freq === 'yearly') {
                                    return plans.some(plan => plan.price && plan.price.yearly);
                                }
                                return true;
                            }).map((freq) => (
                                <Tab
                                    key={freq}
                                    text={freq}
                                    label={t('pages.' + freq)}
                                    selected={selectedFrequency === freq}
                                    setSelected={setSelectedFrequency}
                                    discount={freq === "yearly"}
                                    discountValue={getDiscountValue(plans)}
                                    t={t}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {selectedPlan ? (
                    <div className="flex flex-col items-center gap-10 max-w-3xl w-full">
                        <div className="w-full flex justify-start items-center gap-4">
                            <Button
                                onClick={() => setSelectedPlan(null)}
                                variant="secondary"
                                className="h-fit"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h1 className="text-2xl font-medium md:text-3xl">{selectedPlan.name} {t('pages.plan')}</h1>
                        </div>
                        {!submitData ? (
                            <form className="w-full rounded-2xl border p-6 shadow" onSubmit={handleSubmit(handleSubmitAction)}>
                                <Form register={register} errors={errors} watch={watch} control={control} setValue={setValue} plan={selectedPlan} />

                                <div className="mt-6 flex justify-center gap-10">
                                    <Button type='submit'>{t('components.proceed')}</Button>
                                </div>
                            </form>
                        ) : !loading && (
                            <div className="w-full">
                                <Elements stripe={stripePromise} options={options}>
                                    <CheckoutForm selectedPlan={selectedPlan} submitData={submitData} paymentFrequency={selectedFrequency} />
                                </Elements>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={cn("grid w-full max-w-6xl gap-6 sm:grid-cols-2", plans.length > 2 && " xl:grid-cols-4")}>
                        {plans.map((plan, i) => {
                            const hasPriceForFrequency = !plan.price || plan.price[selectedFrequency];
                            return (plan.id != 'free' || !activeSubscription) && hasPriceForFrequency && (
                                <PlanCard key={i} plan={plan} paymentFrequency={selectedFrequency} select={handlePlanSelection} t={t} />
                            );
                        })}
                    </div>
                )}
            </section>
        </AuthenticatedLayout >
    );
}


function CheckoutForm({ selectedPlan, submitData, paymentFrequency }) {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [paid, setPaid] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }
        try {
            const result = await stripe.confirmSetup({
                elements,
                redirect: 'if_required'
            });

            if (result.setupIntent) {
                if (result.setupIntent.status === "succeeded") {
                    const setup = result.setupIntent;
                    await StripeService.subscribe(
                        {
                            setup_intent_id: setup.id,
                            plan: selectedPlan.id == 'free' ? selectedPlan : selectedPlan.stripe[paymentFrequency],
                            billing_details: submitData,
                            is_credits: selectedPlan.id == 'free',
                        },
                        () => {
                            toast({
                                title: t('pages.successful', { name: t('pages.payment') }),
                                duration: 3000
                            })
                            setPaid(true);
                            setLoading(false);
                            // redirect to profile page
                            router.visit(route('profile.edit'));
                        }
                    );
                    return;
                }
            }
            toast({
                title: t('pages.failed', { name: t('pages.payment') }),
                variant: 'destructive',
                duration: 3000
            })
        } catch (error) {
            console.error(error);
            toast({
                title: t('pages.failed', { name: t('pages.payment') }),
                variant: 'destructive',
                duration: 3000
            })
            setLoading(false);
        }
    }

    return paid ? (
        <div className='bg-gray-100 shadow-lg rounded-lg p-3 flex flex-col items-center justify-center min-h-[50vh]'>
            <svg className="w-12 h-12 mx-auto text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 36 36"
                preserveAspectRatio="xMidYMid meet" fill="currentColor">
                <title>success-standard-solid</title>
                <path className="clr-i-solid clr-i-solid-path-1"
                    d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM28.45,12.63,15.31,25.76,7.55,18a1.4,1.4,0,0,1,2-2l5.78,5.78L26.47,10.65a1.4,1.4,0,1,1,2,2Z">
                </path>
                <rect x="0" y="0" width="36" height="36" fillOpacity="0"></rect>
            </svg>
            <h1 className="text-2xl font-semibold text-black mb-2">{t('pages.successful', { name: t('pages.payment') })}</h1>
            <p className="text-gray-600">{t('pages.you_have_been_subscripted')}.</p>
        </div>
    ) : (
        <form className='bg-gray-100 shadow-lg rounded-lg p-3 min-h-[50vh]' onSubmit={handleSubmit}>
            <PaymentElement options={{
                layout: "accordion",
                loader: 'always'
            }} />
            <div className="mt-6 flex justify-center gap-10">
                <LoadingButton size='lg' variant='yellow' type='submit' loading={loading} t={t}>{t('pages.submit')}</LoadingButton>
            </div>
        </form>
    );
}

const PlanCard = ({ plan, paymentFrequency, select, t }) => {
    const price = plan.price[paymentFrequency];
    const isHighlighted = plan.highlighted;
    const isPopular = plan.is_popular;

    return (
        <div
            className={cn(
                "relative flex flex-col gap-8 overflow-hidden rounded-2xl border p-6 shadow",
                isHighlighted && "bg-foreground text-background",
                isPopular && "outline outline-[rgba(250,204,21,0.8)] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(250,204,21,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(250,204,21,0.3),rgba(255,255,255,0))]",
            )}
        >

            <h2 className="flex items-center gap-3 text-xl font-medium capitalize">
                {plan.name}
                {isPopular && (
                    <Badge className="bg-yellow-500 px-1 py-0.5 text-white hover:bg-yellow-500">
                        🔥 {t('pages.most_popular')}
                    </Badge>
                )}
            </h2>

            <div className="relative h-12">
                {!plan.is_custom_price && typeof price === "number" ? (
                    <>
                        <NumberFlow
                            format={{
                                style: "currency",
                                currency: "EUR",
                                trailingZeroDisplay: "stripIfInteger",
                            }}
                            value={price}
                            className="text-4xl font-medium"
                        />
                        <p className="-mt-2 text-xs font-medium lowercase">/{paymentFrequency == 'monthly' ? t('pages.month') : t('pages.year')}</p>
                    </>
                ) : plan.is_custom_price && plan.price_per_unit ? (
                    <>
                        <NumberFlow
                            format={{
                                style: "currency",
                                currency: "EUR",
                                trailingZeroDisplay: "stripIfInteger",
                            }}
                            value={plan.price_per_unit * (plan.id == 'free' ? emails_amount_default_free : emails_amount_default_plan)}
                            className="text-4xl font-medium"
                        />
                        <p className="-mt-2 text-xs font-medium lowercase">{t('pages.per_each')} {new Intl.NumberFormat('it-IT').format(plan.id == 'free' ? emails_amount_default_free : emails_amount_default_plan)} {t('pages.emails_sent')}</p>
                    </>
                ) : (
                    <h1 className="text-4xl font-medium">{price}</h1>
                )}
            </div>

            <div className="flex-1 space-y-2">
                <h3 className="text-sm font-medium">{plan.description}</h3>
                <ul className="space-y-2">
                    {plan.features && plan.features.map((feature, index) => (
                        <li
                            key={index}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium",
                                isHighlighted ? "text-background" : "text-foreground/60",
                            )}
                        >
                            <BadgeCheck strokeWidth={1} size={16} />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <Button
                onClick={() => select(plan)}
                variant={isHighlighted ? 'secondary' : 'default'}
                className={"h-fit w-full rounded-lg select-none"}
                disabled={plan.disabled}
            >
                {plan.cta}
            </Button>
        </div>
    )
}

const getDiscountValue = (plans) => {
    const popular = plans.find(plan => plan.is_popular);
    if (
        !popular ||
        !popular.price ||
        typeof popular.price.yearly !== 'number' ||
        typeof popular.price.monthly !== 'number' ||
        popular.price.yearly === 0
    ) {
        return null;
    }

    return 100 - Math.round((popular.price.yearly - popular.price.monthly) / popular.price.yearly * 100);
}