import { useEffect, useState } from 'react';
import { DataTable } from '@/Components/DataTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { columnMap, searchKeys } from './columns';
import SubscriberService from '@/Services/SubscriberService';
import { toast } from '@/hooks/use-toast';
import EditForm from '@/Components/forms/Subscriber/edit';
import CreateForm from '@/Components/forms/Subscriber/create';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Index({ inDialog = false, campaignId = null, hideHeaderActions = false }) {
    const { t } = useTranslation();
    const [searchOptions, setSearchOptions] = useState({
        searchField: '',
        searchValue: '',
    });
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (campaignId) {
            setSearchOptions(prev => ({
                ...prev,
                filters: {
                    ...prev.filters,
                    campaign_id: campaignId
                }
            }));
        }
    }, [campaignId]);

    const handleEditAction = (id) => {
        setEditing(true);
        setEditingId(id);
    }

    useEffect(() => {
        if (editing == false) {
            setEditingId(null);
        }
    }, [editing]);

    const handleDeleteAction = (id) => {
        SubscriberService.destroy(id, () => {
            toast({
                title: t('pages.deleted', { name: t('pages.subscriber') }),
                duration: 3000
            });
            setRefreshKey(refreshKey + 1)
        })
    }
    const refreshData = () => {
        setRefreshKey(prevKey => prevKey + 1);
    }
     
    // Dialog/Popup view
    if (inDialog) {
        return (
            <div className="w-full">
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('components.create_button', { entity: t('pages.subscriber') })}
                    </button>
                </div>
                
                <DataTable
                    key={refreshKey}
                    searchRoute={'subscribers'}
                    searchOptions={searchOptions}
                    columnMap={columnMap}
                    searchKeys={searchKeys}
                    relationships={['organization', 'tags']}
                    filters={{
                        'campaign_id': {
                            value: campaignId,
                            hidden: true
                        },
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
                    }}
                    initialOrderBy="id"
                    hideShow={true}
                    onEdit={handleEditAction}
                    onDelete={handleDeleteAction}
                />
                
                {creating && (
                    <CreateForm
                        open={creating}
                        onOpenChange={setCreating}
                        onSuccess={() => {
                            console.log('CreateForm success callback triggered');
                            refreshData();
                        }}
                        campaignId={campaignId} 
                    />
                )}
                
                {editing && (
                    <EditForm
                        id={editingId}
                        open={editing}
                        onOpenChange={setEditing}
                        onSuccess={() => {
                            console.log('EditForm success callback triggered');
                            refreshData();
                        }}
                    />
                )}
            </div>
        );
    }

    // Page view
    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { name: t('menu.subscribers'), href: route('subscribers.index'), current: true },
            ]}
            headerActions={hideHeaderActions ? [] : [
                {
                    icon: <UserPlus />,
                    title: t('components.create_button', { entity: t('pages.subscriber') }),
                    function: () => setCreating(true)
                }
            ]}
            title={t('menu.subscribers')}
        >
            <DataTable
                key={refreshKey}
                searchRoute={'subscribers'}
                searchOptions={searchOptions}
                columnMap={columnMap}
                searchKeys={searchKeys}
                relationships={['organization', 'tags']}
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
                }}
                initialOrderBy="id"
                hideShow={true}
                onEdit={handleEditAction}
                onDelete={handleDeleteAction}
            />
            
            {creating && (
                <CreateForm
                    open={creating}
                    onOpenChange={setCreating}
                    onSuccess={refreshData}
                />
            )}
            
            {editing && (
                <EditForm
                    id={editingId}
                    open={editing}
                    onOpenChange={setEditing}
                    onSuccess={refreshData}
                />
            )}
        </AuthenticatedLayout>
    );
}
