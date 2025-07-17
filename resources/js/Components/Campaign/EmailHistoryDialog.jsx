import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Check, X, ExternalLink, CheckCheck, RefreshCw } from "lucide-react";
import { formatFriendlyDate } from '@/lib/utils';
import CampaignService from '@/Services/CampaignService';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { DataTable } from '@/Components/DataTable';
import { Pagination, PaginationContainer } from '@/Components/ui/pagination';
import './custom-scrollbar.css';
import { Input } from '@/Components/ui/input';
import { Search } from 'lucide-react';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

export default function EmailHistoryDialog({ campaign, initialEmail, open, onOpenChange, initialFilter = "all" }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [emailHistory, setEmailHistory] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [campaignData, setCampaignData] = useState(campaign);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 10,
        total: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [retryingAll, setRetryingAll] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    useEffect(() => {
        if (open) {
            setActiveFilter(initialFilter);
            setActiveTab(initialFilter);
            setSearchTerm('');
            setDateFrom(null);
            setDateTo(null);
            
            if (!isInitialized) {
                setIsInitialized(true);
                setLoading(true);
                
                CampaignService.getStats(campaign.id, (response) => {
                    if (response && response.data) {
                        setCampaignData(response.data);
                        
                        let emailToSelect = null;
                        
                        if (initialEmail && response.data.emails) {
                            emailToSelect = response.data.emails.find(email => email.id === initialEmail.id);
                        } 
                        
                        if (!emailToSelect && response.data.emails && response.data.emails.length > 0) {
                            emailToSelect = response.data.emails[0];
                        }
                        
                        if (emailToSelect) {
                            setSelectedEmail(emailToSelect);
                            
                            // CampaignService.getEmailHistory(
                            //     campaign.id,
                            //     emailToSelect.id,
                            //     1,
                            //     (response) => {
                            //         setEmailHistory(response.data || []);
                            //         setPagination({
                            //             currentPage: response.current_page || 1,
                            //             perPage: response.per_page || 10,
                            //             total: response.total || 0
                            //         });
                            //         setLoading(false);
                            //     },
                            //     initialFilter,
                            //     null,
                            //     null
                            // );
                        } else {
                            setLoading(false);
                        }
                    } else {
                        setLoading(false);
                    }
                });
            } else if (selectedEmail) {
                setLoading(true);
                loadEmailHistory(selectedEmail.id, 1);
            }
        }
        
        if (!open) {
            setIsInitialized(false);
        }
    }, [open, campaign, initialFilter]);
    
    useEffect(() => {
        if (selectedEmail && open && isInitialized && 
            !(pagination.currentPage === 1 && !dateFrom && !dateTo)) {
            
            loadEmailHistory(selectedEmail.id, pagination.currentPage);
        }
    }, [pagination.currentPage, activeFilter, dateFrom, dateTo]);
    
    useEffect(() => {
        if (selectedEmail && open && isInitialized) {
            
            setPagination(prev => ({
                ...prev,
                currentPage: 1
            }));
            loadEmailHistory(selectedEmail.id, 1);
        }
    }, [selectedEmail]);

    const loadEmailHistory = async (emailId, page = 1) => {
        setLoading(true);
        await CampaignService.getEmailHistory(
            campaign.id,
            emailId,
            page,
            (response) => {
                setEmailHistory(response.data || []);
                setPagination({
                    currentPage: response.current_page || 1,
                    perPage: response.per_page || 10,
                    total: response.total || 0
                });
                setLoading(false);
            },
            activeFilter,
            dateFrom ? format(dateFrom, 'yyyy-MM-dd') : null,
            dateTo ? format(dateTo, 'yyyy-MM-dd') : null
        );
    };

    const handleRetryEmail = async (id) => {
        setLoading(true);
        await CampaignService.retryEmails(campaign.id, [id], (response) => {
            if (response && response.success) {
                toast({
                    title: t('components.success'),
                    description: t('components.email_retry_queued'),
                    duration: 3000
                });
                loadEmailHistory(selectedEmail.id, pagination.currentPage);
            }
        });
    };

    const handleRetryAllFailedEmails = async () => {
        if (retryingAll) return;
        
        setRetryingAll(true);
        
        const failedEmails = filteredEmailHistory.filter(item => item.exception);
        if (failedEmails.length === 0) {
            toast({
                title: t('components.info'),
                description: t('pages.no_failed_emails'),
                duration: 3000
            });
            setRetryingAll(false);
            return;
        }
        
        const emailIds = failedEmails.map(email => email.id);
        
        await CampaignService.retryEmails(campaign.id, emailIds, (response) => {
            if (response && response.success) {
                toast({
                    title: t('components.success'),
                    description: t('components.email_retry_queued', { count: emailIds.length }),
                    duration: 3000
                });
                loadEmailHistory(selectedEmail.id, pagination.currentPage);
            }
        });
        
        setRetryingAll(false);
    };

    const handleEmailSelect = (email) => {
        setSelectedEmail(email);
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    };

    // Filter email history based on active tab and search term
    const filteredEmailHistory = useMemo(() => {
        if (!emailHistory || emailHistory.length === 0) return [];
        
        let filtered = emailHistory;
        
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                (item.name && item.name.toLowerCase().includes(term)) || 
                (item.email && item.email.toLowerCase().includes(term))
            );
        }
        
        return filtered;
    }, [emailHistory, searchTerm]);

    // Render email history item
    const renderEmailItem = (item) => (
        <div key={item.id} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.email}</p>
                        
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        {item.exception ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {t('components.failed')}
                            </Badge>
                        ) : item.opened ? (
                            <Badge variant="success" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                                <CheckCheck className="h-3 w-3" />
                                {t('pages.opened')}
                            </Badge>
                        ) : (
                            <Badge variant="success" className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                {t('components.sent')}
                            </Badge>
                        )}
                    </div>
                    {!item.exception && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        {item.sent_at && ( 
                            <p>
                            <span className="font-medium">{t('pages.sent_at')}: 
                            </span>{formatFriendlyDate(item.sent_at, true)}
                            </p>
                        )}
                        {item.opened && (
                            <p><span className="font-medium">{t('pages.opened_at')}: </span> 
                            {item.opened_at
                                ? formatFriendlyDate(item.opened_at, true) 
                                : formatFriendlyDate(item.sent_at, true)
                            }
                            </p>
                        )}
                        </div>
                    )}
                    {item.exception && item.failed_at && (
                        <div className="mt-2 text-xs text-muted-foreground">
                            <p>
                                <span className="font-medium">{t('pages.failed_at')}: </span>
                                {formatFriendlyDate(item.failed_at, true)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {item.exception && (
                <div className="mt-3 w-full">
                    <div className="p-3 bg-destructive/10 rounded text-sm text-destructive border border-destructive/20">
                        <p className="font-medium">{t('components.error')}:</p>
                        <p className="mt-1 break-words">{item.exception}</p>
                    </div>
                    <div className='flex justify-end'>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => handleRetryEmail(item.id)}
                        >
                            <Mail className="h-3 w-3 mr-1" />
                            {t('components.retry')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderEmptyState = () => (
        <div className="text-center py-10 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{t('pages.no_emails_found')}</p>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('pages.campaign_email_history', {
                        campaign: campaignData.name && campaignData.name.length > 30 
                            ? campaignData.name.substring(0, 30) + '...' 
                            : campaignData.name
                    })}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full overflow-hidden">
                    {campaignData && campaignData.emails && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                            {campaignData.emails.map((email) => (
                                <Button
                                    key={email.id}
                                    variant={selectedEmail && selectedEmail.id === email.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleEmailSelect(email)}
                                    className="whitespace-nowrap"
                                >
                                    {(email.title || email.subject || `Email ${email.step}`).length > 20
                                        ? (email.title || email.subject || `Email ${email.step}`).substring(0, 20) + '...'
                                        : (email.title || email.subject || `Email ${email.step}`)}
                                    {email.sent_subscribers_count > 0 && initialFilter !== 'failed' && (
                                        <Badge variant="secondary" className="flex flex-col items-center justify-center px-1 py-0 ml-2">
                                            <span className='text-[11px] leading-tight'>{email.sent_subscribers_count}</span>
                                            <span className="text-[10px] leading-tight">{t('components.sent')}</span>
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="w-full">
                        <div className="flex justify-between items-center mb-4 gap-2">                            
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateFrom && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFrom ? format(dateFrom, "dd/MM/yy") : t('components.from_date')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={setDateFrom}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateTo && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateTo ? format(dateTo, "dd/MM/yy") : t('components.to_date')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={setDateTo}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {(dateFrom || dateTo) && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                            const resetDates = async () => {
                                                setDateFrom(null);
                                                setDateTo(null);
                                                
                                                setPagination(prev => ({
                                                    ...prev,
                                                    currentPage: 1
                                                }));
                                                
                                                setLoading(true);
                                                
                                                if (selectedEmail) {
                                                    await CampaignService.getEmailHistory(
                                                        campaign.id,
                                                        selectedEmail.id,
                                                        1,
                                                        (response) => {
                                                            setEmailHistory(response.data || []);
                                                            setPagination({
                                                                currentPage: response.current_page || 1,
                                                                perPage: response.per_page || 10,
                                                                total: response.total || 0
                                                            });
                                                            setLoading(false);
                                                        },
                                                        activeFilter,
                                                        null,
                                                        null
                                                    );
                                                } else {
                                                    setLoading(false);
                                                }
                                            };
                                            
                                            resetDates();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {activeFilter === "failed" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                        onClick={handleRetryAllFailedEmails}
                                        disabled={retryingAll || loading}
                                    >
                                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                        {retryingAll ? t('components.retrying') : t('components.retry_all')}
                                    </Button>
                                )}
                                
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('components.search')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : filteredEmailHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredEmailHistory.map(renderEmailItem)}
                                </div>
                            ) : (
                                renderEmptyState()
                            )}
                        </div>
                    </div>

                    {!loading && filteredEmailHistory.length > 0 && pagination.total > pagination.perPage && (
                        <div className="flex justify-center mt-4">
                            <PaginationContainer
                                count={Math.ceil(pagination.total / pagination.perPage)}
                                page={pagination.currentPage}
                                onChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );}
