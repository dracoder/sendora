import { useState, useEffect } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import { Coins, History as HistoryIcon, Wallet2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import TransactionDialog from './Show';
import PurchaseCreditsDialog from './Purchase';
import CreditTransactionService from '@/Services/CreditTransactionService';

export default function History({ availableCredits, data }) {
    const { t } = useTranslation();
    const [searchOptions, setSearchOptions] = useState({
        searchField: '',
        searchValue: '',
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const [showDialog, setShowDialog] = useState(false);
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(availableCredits);
    const [pagination, setPagination] = useState({
        currentPage: data?.current_page || 1,
        perPage: data?.per_page || 10,
        total: data?.total || 0
    });

    useEffect(() => {
        if (data) {
            setPagination({
                currentPage: data.current_page,
                perPage: data.per_page,
                total: data.total
            });
        }
    }, [data]);

    const handleShowAction = (id) => {
        setLoading(true);
        CreditTransactionService.show(id, (data) => {
            setTransaction(data.data);
            setShowDialog(true);
            setLoading(false);
        });
    };

    const handlePurchaseComplete = () => {
        refreshCredits();
        setRefreshKey(prev => prev + 1);
    };

    const refreshCredits = () => {
        CreditTransactionService.getBalance((data) => {
            if (data && data.available_credits !== undefined) {
                setCredits(data.available_credits);
            } else if (data && data.data !== undefined) {
                setCredits(data.data);
            }
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.credit_transactions'), href: route('credit-transactions.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <Coins className="h-4 w-4" />,
                    title: `${t('pages.available_credits')}: ${credits}`,
                    className: "pointer-events-none bg-secondary hover:bg-secondary",
                    disabled: true
                },
                {
                    icon: <HistoryIcon />,
                    title: t('pages.refresh'),
                    function: () => {
                        refreshCredits();
                        setRefreshKey(refreshKey + 1);
                    }
                },
                {
                    icon: <Wallet2Icon />,
                    title: t('pages.purchase_credits'),
                    function: () => setShowPurchaseDialog(true)
                }
            ]}
            title={t('pages.credit_transactions')}
        >
            {/* <div className="mb-4 p-4 rounded-lg shadow text-center border">
                <h2 className="text-lg font-medium">{t('pages.available_credits')}</h2>
                <p className="text-3xl font-bold">{credits}</p>
            </div> */}
            
            <DataTable
                key={refreshKey}
                searchRoute={'credit-transactions'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                initialOrderBy="created_at"
                initialOrderDir="desc"
                hideEdit
                hideDelete
                onShow={handleShowAction}
                initialData={data}
                pagination={pagination}
                onPaginationChange={setPagination}
            />

            <TransactionDialog 
                transaction={transaction} 
                open={showDialog} 
                onOpenChange={setShowDialog} 
            />

            <PurchaseCreditsDialog
                open={showPurchaseDialog}
                onOpenChange={setShowPurchaseDialog}
                onPurchaseComplete={handlePurchaseComplete}
            />
        </AuthenticatedLayout>
    );
}