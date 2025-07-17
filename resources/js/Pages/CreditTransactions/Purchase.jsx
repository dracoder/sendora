import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Loader2, CreditCard, Coins, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/Components/ui/badge';
import CreditTransactionService from '@/Services/CreditTransactionService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(window.stripePublicKey || import.meta.env.VITE_STRIPE_KEY);

function getStripeAppearance(isDarkMode) {
    return {
        theme: isDarkMode ? 'night' : 'stripe',
        variables: {
            colorPrimary: isDarkMode ? '#0ea5e9' : '#0ea5e9',
            colorBackground: isDarkMode ? '#1e293b' : '#ffffff',
            colorText: isDarkMode ? '#ffffff' : '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
        rules: {
            '.Input': {
                backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                borderColor: isDarkMode ? '#334155' : '#e5e7eb',
            },
            '.Input:focus': {
                borderColor: isDarkMode ? '#0ea5e9' : '#0ea5e9',
            },
            '.Label': {
                color: isDarkMode ? '#cbd5e1' : '#6b7280',
            },
            '.Tab': {
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#cbd5e1' : '#6b7280',
            },
            '.Tab:hover': {
                color: isDarkMode ? '#ffffff' : '#1f2937',
            },
            '.Tab--selected': {
                borderColor: isDarkMode ? '#0ea5e9' : '#0ea5e9',
                color: isDarkMode ? '#ffffff' : '#1f2937',
            },
        }
    };
}

function CheckoutForm({ clientSecret, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const result = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (result.error) {
            toast({
                title: t('errors.error'),
                description: result.error.message,
                variant: 'destructive',
            });
            setProcessing(false);
            onCancel();
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                CreditTransactionService.confirmPurchase(result.paymentIntent.id, (data) => {
                    toast({
                        title: t('pages.successful', { name: t('pages.purchase') }),
                        description: t('pages.credit_purchase_success', { name: 'credits' }),
                    });
                    onSuccess();
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <div className="flex justify-end space-x-2 mt-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    disabled={processing}
                >
                    {t('components.cancel')}
                </Button>
                <Button 
                    type="submit" 
                    disabled={!stripe || processing}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('components.please_wait')}
                        </>
                    ) : (
                        t('pages.purchase')
                    )}
                </Button>
            </div>
        </form>
    );
}

export default function PurchaseCreditsDialog({ open, onOpenChange, onPurchaseComplete }) {
    const { t } = useTranslation();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    useEffect(() => {
        if (open) {
            loadCreditPackages();
        } else {
            resetState();
        }
    }, [open]);

    const resetState = () => {
        setShowPaymentForm(false);
        setClientSecret('');
        setSelectedPackage(null);
        setPurchasing(false);
    };

    const loadCreditPackages = async () => {
        setLoading(true);
        try {
            CreditTransactionService.getPackages((data) => {
                setPackages(data.data.filter(pkg => pkg.is_active));
                setLoading(false);
            });
        } catch (error) {
            console.error('Failed to load credit packages:', error);
            toast({
                title: t('errors.error'),
                description: t('errors.failed_to_load'),
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    const handlePurchase = async (creditPackage) => {
        setPurchasing(true);
        setSelectedPackage(creditPackage.id);
        
        try {
            CreditTransactionService.purchaseCredits(
                creditPackage.id, 
                (data) => {
                    setClientSecret(data.clientSecret);
                    setShowPaymentForm(true);
                    setPurchasing(false);
                },
                (errorMessage) => {
                    toast({
                        title: t('errors.error'),
                        description: errorMessage || t('errors.purchase_failed'),
                        variant: 'destructive',
                    });
                    setPurchasing(false);
                    setSelectedPackage(null);
                }
            );
        } catch (error) {
            console.error('Failed to initiate purchase:', error);
            toast({
                title: t('errors.error'),
                description: t('errors.purchase_failed'),
                variant: 'destructive',
            });
            setPurchasing(false);
            setSelectedPackage(null);
        }
    };

    const handlePaymentSuccess = () => {
        onPurchaseComplete();
        onOpenChange(false);
        resetState();
    };

    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
        setClientSecret('');
        setSelectedPackage(null);
    };

    const getPricePerCredit = (price, credits) => {
        return (price / credits).toFixed(3);
    };
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains('dark')
    );
    
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
        
        return () => observer.disconnect();
    }, []);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {showPaymentForm 
                            ? t('pages.complete_purchase') 
                            : t('pages.purchase_credits')}
                    </DialogTitle>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : showPaymentForm && clientSecret ? (
                    <Elements 
                        stripe={stripePromise} 
                        options={{ 
                            clientSecret,
                            appearance: getStripeAppearance(isDarkMode)
                        }}
                    >
                        <CheckoutForm 
                            clientSecret={clientSecret} 
                            onSuccess={handlePaymentSuccess}
                            onCancel={handlePaymentCancel}
                        />
                    </Elements>
                ) : packages.length === 0 ? (
                    <div className="text-center py-8">
                        <p>{t('pages.no_packages_available')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        {packages.map((pkg) => (
                            <Card 
                                key={pkg.id} 
                                className={`transition-all shadow-md`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                        {pkg.featured === 1 && (
                                            <Badge variant="outline" className="bg-black dark:bg-white text-white dark:text-black ">
                                                {t('pages.featured')}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>{pkg.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Coins className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-lg">{pkg.credits} {t('pages.credits')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{pkg.price} €</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Info className="h-3 w-3" />
                                            <span>{getPricePerCredit(pkg.price, pkg.credits)} € {t('pages.per_each')} {t('pages.credit')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full mt-2" 
                                        variant="outline"
                                        onClick={() => !purchasing && handlePurchase(pkg)}
                                        disabled={purchasing}
                                    >
                                        {purchasing && selectedPackage === pkg.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('components.please_wait')}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                {t('pages.purchase')}
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}