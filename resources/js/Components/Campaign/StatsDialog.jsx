import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import CampaignService from '@/Services/CampaignService';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import EmailHistoryDialog from '@/Components/Campaign/EmailHistoryDialog';

export default function StatsDialog({ campaign, open, onOpenChange }) {
    const { t } = useTranslation();
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [emailHistory, setEmailHistory] = useState({
        data: [],
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [emailHistoryOpen, setEmailHistoryOpen] = useState(false);
    const [selectedEmailForHistory, setSelectedEmailForHistory] = useState(null);

    useEffect(() => {
        if (open && !campaign) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [open, campaign]);

    const handleEmailClick = (email) => {
        if (!email.sent_subscribers_count) {
            return;
        }
        setSelectedEmailForHistory(email);
        setEmailHistoryOpen(true);
    };

    // const calculateOpenRate = () => {
    //     if (!campaign.emails || campaign.emails.length === 0) return '0%';
        
    //     const totalSent = campaign.emails.reduce((sum, email) => sum + (email.sent_subscribers_count || 0), 0);
    //     const totalOpened = campaign.emails.reduce((sum, email) => sum + (email.opened_count || 0), 0);
        
    //     if (totalSent === 0) return '0%';
        
    //     const rate = (totalOpened / totalSent) * 100;
    //     return `${rate.toFixed(2)}%`;
    // };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedEmail 
                                ? t('pages.campaign_email_history', { 
                                    campaign: campaign?.name || ''
                                }) 
                                : t('pages.campaign_statistics')}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">{t('components.loading')}</span>
                        </div>
                    ) : campaign ? (
                        <div className="w-full">
                            <div className="mb-4">
                                <p className="text-lg">
                                    <span className="font-medium">{t('pages.subscribers')}:</span> <strong>{campaign.subscribers_count || 0}</strong>
                                </p>
                                <p className="text-lg">
                                    <span className="font-medium">{t('pages.open_rate')}:</span> <strong>{campaign.open_rate || 0}%</strong>
                                </p>
                            </div>
                            
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted">
                                        <TableHead>{t('pages.email')}</TableHead>
                                        {/* <TableHead className="text-center">{t('pages.subscribers')}</TableHead> */}
                                        <TableHead className="text-center">{t('pages.sent')}</TableHead>
                                        <TableHead className="text-center">{t('pages.opened')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaign.emails && campaign.emails.length > 0 ? (
                                        campaign.emails.map((email) => {
                                            const sentCount = email.sent_subscribers_count || 0;
                                            const openedCount = email.opened_count || 0;
                                            // const subscriberCount = email.total_subscribers_count || 0;
                                            
                                            return (
                                                <TableRow 
                                                    key={email.id} 
                                                    className={`cursor-pointer ${sentCount ? 'hover:bg-muted/50' : ''}`}
                                                    onClick={() => handleEmailClick(email)}
                                                >
                                                    <TableCell>{email.title}</TableCell>
                                                    {/* <TableCell className="text-center">{subscriberCount}</TableCell> */}
                                                    <TableCell className="text-center">{sentCount}</TableCell>
                                                    <TableCell className="text-center">
                                                        {openedCount}
                                                        {sentCount > 0 && (
                                                            <span className="ml-2 text-muted-foreground">
                                                                ({((openedCount / sentCount) * 100).toFixed(2)}%)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">{t('pages.no_data')}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p>{t('components.error_loading_data')}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            
            {selectedEmailForHistory && (
                <EmailHistoryDialog 
                    campaign={campaign}
                    initialEmail={selectedEmailForHistory}
                    open={emailHistoryOpen}
                    onOpenChange={setEmailHistoryOpen}
                />
            )}
        </>
    );
}