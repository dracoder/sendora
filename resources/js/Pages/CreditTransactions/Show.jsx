import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Coins, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export default function TransactionDialog({ transaction, open, onOpenChange }) {
    const { t } = useTranslation();

    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        {t('pages.transaction_details')}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-4">
                       
                        {transaction.metadata && transaction.metadata.package_name && (
                            <div>
                                <h3 className="text-sm font-semibold">{t('pages.package_name')}</h3>
                                <p className="mt-1">{transaction.metadata.package_name}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-semibold">{t('pages.date')}</h3>
                            <p className="mt-1">{new Date(transaction.created_at).toLocaleString()}</p>
                        </div>
                        {/* {transaction.description && (
                        <div>
                            <h3 className="text-sm font-semibold">{t('pages.description')}</h3>
                            <p className="mt-1">{transaction.description}</p>
                        </div>
                         )} */}
                        <div>
                            <h3 className="text-sm font-semibold">{t('pages.credit_type')}</h3>
                            <p className="mt-1">{t(`pages.${transaction.type}`)}</p>
                        </div>
                
                    </div>
                    
                    <div className="space-y-4">

                        <div>
                            <h3 className="text-sm font-semibold">{t('pages.status')}</h3>
                            <p className="mt-1 flex items-center gap-1 text-sm">
                                <span className={`inline-block w-2 h-2 rounded-full ${transaction.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {t(`pages.${transaction.status}`)}
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-semibold">{t('pages.credits')}</h3>
                            <p className={`mt-1 ${transaction.amount > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`}>
                                {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                            </p>
                        </div>
                        
                        {transaction.usage !== undefined && (
                            <div>
                                <h3 className="text-sm font-semibold">{t('pages.usage')}</h3>
                                <p className="mt-1 text-blue-600 font-semibold">
                                    {transaction.usage} / {transaction.amount}
                                </p>
                                {transaction.amount > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full" 
                                            style={{ width: `${Math.min(100, (transaction.usage / transaction.amount) * 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
            </DialogContent>
        </Dialog>
    );
}