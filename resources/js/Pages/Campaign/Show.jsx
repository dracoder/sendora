
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { BarChart } from 'lucide-react';
import StatsDialog from '@/Components/Campaign/StatsDialog';

export default function Show({ campaign }) {
    const { t } = useTranslation();
    const [statsOpen, setStatsOpen] = useState(false);

    // Add a check to ensure campaign exists and has an id
    if (!campaign || !campaign.id) {
        return (
            <AuthenticatedLayout
                title={t('pages.campaign')}
                breadcrumbs={[
                    { name: t('menu.campaigns'), href: route('campaigns.index') },
                    { name: t('pages.campaign'), current: true },
                ]}
            >
                <div className="p-6 text-center">
                    <p>{t('messages.campaign_not_found')}</p>
                    <Button 
                        className="mt-4"
                        onClick={() => window.history.back()}
                    >
                        {t('pages.go_back')}
                    </Button>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            title={campaign.name}
            breadcrumbs={[
                { name: t('menu.campaigns'), href: route('campaigns.index') },
                { name: campaign.name, href: route('campaigns.show', campaign.id), current: true },
            ]}
            headerActions={[
                {
                    title: t('components.edit_button', { entity: t('pages.campaign') }),
                    href: route('campaigns.edit', campaign.id)
                }
            ]}
        >
            <div className="mb-4 flex justify-end">
                <Button 
                    onClick={() => setStatsOpen(true)} 
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <BarChart className="h-4 w-4" />
                    {t('pages.view_statistics')}
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-medium">{t('pages.campaign_details')}</h3>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-medium">{t('pages.name')}:</span> {campaign.name}</p>
                                <p><span className="font-medium">{t('pages.organization')}:</span> {campaign.organization?.name}</p>
                                <p><span className="font-medium">{t('pages.status')}:</span> {campaign.is_active ? t('messages.active') : t('messages.inactive')}</p>
                                <p><span className="font-medium">{t('pages.created_at')}:</span> {new Date(campaign.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium">{t('pages.emails')}</h3>
                            <div className="mt-2 space-y-2">
                                {campaign.emails?.map((email, index) => (
                                    <div key={email.id} className="p-2 border rounded">
                                        <p className="font-medium">{index + 1}. {email.title}</p>
                                        <p>{t('pages.subject')}: {email.subject}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <StatsDialog 
                campaign={campaign} 
                open={statsOpen} 
                onOpenChange={setStatsOpen} 
            />
        </AuthenticatedLayout>
    );
}
