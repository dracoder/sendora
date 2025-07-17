import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import CampaignService from '@/Services/CampaignService';
import { toast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { MailPlus, AlertTriangle, BarChart, Mail, MailX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import StatsDialog from '@/Components/Campaign/StatsDialog';
import EmailHistoryDialog from '@/Components/Campaign/EmailHistoryDialog';
import SubscriberIndex from '@/Pages/Subscriber/Index';

import { columnMap as subscribersColumnMap, searchKeys as subscribersSearchKeys } from '../Subscriber/columns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/Components/ui/input';
import { formatFriendlyDate } from '@/lib/utils';

export default function Index({ creditInfo }) {
    const { t } = useTranslation();
        
    const [searchOptions, setSearchOptions] = useState({
        searchField: '',
        searchValue: '',
    });
    const [refreshKey, setRefreshKey] = useState(0);
    const [emailHistoryOpen, setEmailHistoryOpen] = useState(false);
    const [selectedCampaignForHistory, setSelectedCampaignForHistory] = useState(null);
    const [initialHistoryFilter, setInitialHistoryFilter] = useState("success");

    const handleDeleteAction = (id) => {
        CampaignService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.campaign') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }

    useEffect(() => {
        columnMap['subscribers_count']['onClick'] = campaign => handleSubscribersAction(campaign);
        
        if (columnMap['actions']) {
            columnMap['actions'] = {
                ...columnMap['actions']
            };
        }
    }, []);

    useEffect(() => {
        // check if the subscribersSearchKeys have full name, if yes, remove it and add first_name and last_name to it
        if (subscribersSearchKeys.includes('full_name')) {
            subscribersSearchKeys.splice(subscribersSearchKeys.indexOf('full_name'), 1);
            subscribersSearchKeys.push('first_name', 'last_name');
        }
    }, []);

    const [showSubscribersList, setShowSubscribersList] = useState(false);
    const [subscribersList, setSubscribersList] = useState([]);
    const [filteredSubscribersList, setFilteredSubscribersList] = useState([]);
    const [statsOpen, setStatsOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const handleSubscribersAction = (campaign) => {
        if (!campaign.subscribers_count) {
            return;
        }
        setShowSubscribersList(true);
        setSubscribersList(campaign.subscribers_list);
        setSelectedCampaign(campaign);
    }

    const closeSubscribersList = () => {
        setShowSubscribersList(false);
        setSubscribersList([]);
    }

    useEffect(() => {
        setFilteredSubscribersList(subscribersList);
    }, [subscribersList]);

    const searchDialog = (e) => {
        const searchValue = e.target.value;

        if (searchValue) {
            // search through the subscribersSearchKeys
            const filteredSubscribers = subscribersList.filter(subscriber => {
                let found = false;
                subscribersSearchKeys.forEach(key => {
                    if (subscriber[key] && subscriber[key].toLowerCase().includes(searchValue.toLowerCase())) {
                        found = true;
                    }
                });
                return found;
            });
            setFilteredSubscribersList(filteredSubscribers);
        } else {
            setFilteredSubscribersList(subscribersList);
        }
    }

    const handleStatsAction = (campaign) => {
        setSelectedCampaign(null);
        setStatsOpen(true);
        
        CampaignService.getStats(campaign.id, (campaignWithStats) => {
            setSelectedCampaign(campaignWithStats.data);
        });
    }

    const handleEmailHistoryAction = (campaign) => {
        if (emailHistoryOpen) {
            setEmailHistoryOpen(false);
            setTimeout(() => {
                setSelectedCampaignForHistory(campaign);
                setInitialHistoryFilter("success");
                setEmailHistoryOpen(true);
            }, 100);
        } else {
            setSelectedCampaignForHistory(campaign);
            setInitialHistoryFilter("success");
            setEmailHistoryOpen(true);
        }
    };

    const handleFailedEmailsAction = (campaign) => {
        if (emailHistoryOpen) {
            setEmailHistoryOpen(false);
            setTimeout(() => {
                setSelectedCampaignForHistory(campaign);
                setInitialHistoryFilter("failed");
                setEmailHistoryOpen(true);
            }, 100);
        } else {
            setSelectedCampaignForHistory(campaign);
            setInitialHistoryFilter("failed");
            setEmailHistoryOpen(true);
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.campaigns'), href: route('campaigns.index'), current: true },
            ]}
            headerActions={[
                {
                    icon: <MailPlus />,
                    title: t('components.create_button', { entity: t('pages.campaign') }),
                    href: route('campaigns.create')
                }
            ]}
            title={t('menu.campaigns')}
        >
            {creditInfo && creditInfo.showCreditWarning && (
                <div className="bg-red-50 dark:opacity-85 dark:bg-gray-800/50 border-l-4 border-red-700/50 p-4 mb-6 rounded-r">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-700/50" />
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                            <p className="text-sm text-red-700 dark:text-white font-medium">
                                {t('pages.no_credits_campaign_warning')}
                            </p>
                            <div className="mt-3 md:mt-0 md:ml-6">
                                <Button 
                                    variant="outline" 
                                    className="flex items-center gap-2 text-red-700 dark:text-white hover:text-red-800 dark:hover:text-gray-100 border-red-300 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-800/50"
                                    asChild
                                >
                                    <Link href={route('credit-transactions.index')}>
                                        {t('pages.purchase_credits')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <DataTable
                key={refreshKey}
                searchRoute={'campaigns'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                relationships={['organization']}
                filters={{
                    'organization_id': {
                        label: t('pages.organization'),
                        type: 'asyncSelect',
                        model: 'Organization',
                        labelKey: 'name',
                        orderBy: 'id',
                        searchKeys: ['name', 'email', 'owner_name'],
                        placeholder: t('components.select_one'),
                        preload: true,
                    },
                    'is_active': {
                        label: t('pages.is_active'),
                        type: 'select',
                        options: [
                            { label: t('components.yes'), value: '1' },
                            { label: t('components.no'), value: '0' },
                        ]
                    },
                }}
                //resource={true}
                initialOrderBy="id"
                hideShow={true}
                onEdit={(id) => router.visit(route('campaigns.edit', id))}
                onDelete={handleDeleteAction}
                actions={[
                    {
                        icon: <BarChart className="h-4 w-4" />,
                        label: t('pages.view_statistics'),
                        onClick: (row) => handleStatsAction(row)
                    },
                    {
                        icon: <Mail className="h-4 w-4" />,
                        label: t('pages.view_email_history'),
                        onClick: (row) => handleEmailHistoryAction(row)
                    },
                    {
                        icon: <MailX className="h-4 w-4" />,
                        label: t('pages.view_failed_emails'),
                        onClick: (row) => handleFailedEmailsAction(row)
                    },
                ]}
            />

            <Dialog open={showSubscribersList} onOpenChange={closeSubscribersList}>
                <DialogContent className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>{t('pages.campaign')} {t('menu.subscribers')}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedCampaign && (
                        <SubscriberIndex 
                            inDialog={true}
                            campaignId={selectedCampaign.id}
                            hideHeaderActions={true}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {selectedCampaign && (
                <StatsDialog 
                    campaign={selectedCampaign} 
                    open={statsOpen} 
                    onOpenChange={setStatsOpen} 
                />
            )}
            {selectedCampaignForHistory && (
                <EmailHistoryDialog 
                    campaign={selectedCampaignForHistory} 
                    open={emailHistoryOpen} 
                    onOpenChange={setEmailHistoryOpen} 
                    initialFilter={initialHistoryFilter}
                />
            )}
        </AuthenticatedLayout>
    )
}
